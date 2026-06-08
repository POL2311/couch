import { NextRequest, NextResponse } from "next/server";
import { getStudents, addStudent } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { type Student, type Stage } from "@/lib/mock-data";
import { stripe, stripeEnabled, SUBSCRIPTION_PRICE_MXN, SUBSCRIPTION_CURRENCY } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    // Coach: solo sus alumnos. Admin: todos. Cliente: ninguno por esta vía.
    if (user.role === "CLIENT") {
      return NextResponse.json([]);
    }
    const students = await getStudents(user.role === "COACH" ? user.coachId ?? undefined : undefined);
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const contentType = request.headers.get("content-type") || "";
    let data: any = {};
    let photoName: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      // Extract fields
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const stage = formData.get("stage") as Stage;
      const stageNumber = parseInt(formData.get("stageNumber") as string) || 1;
      const startingWeight = parseFloat(formData.get("startingWeight") as string) || 0;
      const height = parseFloat(formData.get("height") as string) || 0;
      
      const bodyFatStr = formData.get("bodyFat") as string;
      const bodyFat = bodyFatStr ? parseFloat(bodyFatStr) : undefined;
      
      const chestStr = formData.get("chest") as string;
      const chest = chestStr ? parseFloat(chestStr) : undefined;
      
      const waistStr = formData.get("waist") as string;
      const waist = waistStr ? parseFloat(waistStr) : undefined;
      
      const hipsStr = formData.get("hips") as string;
      const hips = hipsStr ? parseFloat(hipsStr) : undefined;

      // Extract file
      const photoFile = formData.get("photo") as File | null;
      if (photoFile && photoFile.size > 0) {
        // Save the file
        const arrayBuffer = await photoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Ensure folder public/uploads exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Generate a unique filename
        const ext = path.extname(photoFile.name) || ".png";
        const filename = `student_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
        
        photoName = `/uploads/${filename}`;
      }

      data = {
        name,
        email,
        stage,
        stageNumber,
        startingWeight,
        height,
        bodyFat,
        chest,
        waist,
        hips,
        photoName
      };
    } else {
      // Fallback for JSON
      data = await request.json();
    }

    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Nombre y correo son requeridos" }, { status: 400 });
    }

    // Generate avatar initials
    const words = data.name.trim().split(/\s+/);
    const initials = words.length > 1 
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase();

    // Create the new student model
    const newStudent: Student = {
      id: "",
      name: data.name,
      email: data.email,
      avatarInitials: initials,
      avatarColor: "linear-gradient(135deg, var(--accent-primary), var(--text-secondary))",
      currentWeight: data.startingWeight,
      previousWeight: data.startingWeight,
      lastWeighIn: new Date().toISOString().split("T")[0],
      stage: data.stage || "Volumen",
      stageNumber: data.stageNumber || 1,
      paymentStatus: "inactive",
      joinedDate: new Date().toISOString().split("T")[0],
      completionRate: 100,
      streak: 1,
    };

    // Create the detailed measurements and history
    const detail = {
      weightHistory: [
        { date: newStudent.lastWeighIn, weight: data.startingWeight }
      ],
      diet: {
        name: "Dieta no asignada",
        totalCalories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 },
        meals: []
      },
      routine: {
        name: "Rutina no asignada",
        daysPerWeek: 0,
        days: []
      },
      measurements: [
        {
          date: newStudent.lastWeighIn,
          chest: data.chest || 0,
          waist: data.waist || 0,
          hips: data.hips || 0,
          armL: 0,
          armR: 0,
          thighL: 0,
          thighR: 0
        }
      ],
      nextStageDate: null,
      notes: "Alumno registrado correctamente. Asigne su dieta y rutina.",
      height: data.height,
      bodyFat: data.bodyFat,
      photoName: data.photoName
    };

    const coachId = user.role === "COACH" ? user.coachId ?? undefined : undefined;
    const created = await addStudent(newStudent, detail, coachId);

    // ── Stripe: registrar cliente y generar checkout de suscripción ──
    let checkoutUrl: string | null = null;

    if (stripeEnabled()) {
      try {
        const customer = await stripe.customers.create({
          name: data.name,
          email: data.email,
          metadata: { studentId: created.id },
        });

        await prisma.student.update({
          where: { id: created.id },
          data: { stripeCustomerId: customer.id },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

        const coachConnect = user.coachId
          ? await prisma.coach.findUnique({
              where: { id: user.coachId },
              select: { stripeConnectId: true, stripeOnboardingComplete: true },
            })
          : null;

        const connectParams =
          coachConnect?.stripeOnboardingComplete && coachConnect.stripeConnectId
            ? {
                payment_intent_data: {
                  application_fee_amount: 10000,
                  transfer_data: { destination: coachConnect.stripeConnectId },
                },
              }
            : {};

        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: SUBSCRIPTION_CURRENCY,
                product_data: { name: "Suscripción MyCoach" },
                recurring: { interval: "month" },
                unit_amount: SUBSCRIPTION_PRICE_MXN,
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${appUrl}/portal?payment=success`,
          cancel_url: `${appUrl}/portal/blocked`,
          ...connectParams,
        });

        checkoutUrl = session.url;
      } catch (stripeErr: any) {
        console.error("[Stripe] Error creando cliente/checkout:", stripeErr.message);
      }
    }

    return NextResponse.json({ ...created, checkoutUrl });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
