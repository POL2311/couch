import fs from "fs/promises";
import path from "path";
import { MOCK_STUDENTS, getStudentDetail as generateBaseDetail, type Student, type StudentDetail } from "./mock-data";
import { DIET_TEMPLATES, ROUTINE_TEMPLATES } from "./templates";

const dbPath = path.join(process.cwd(), "src", "lib", "database.json");

export interface ScheduledChange {
  executionDate: string;
  stage: any;
  stageNumber: number;
  dietTemplateId?: string;
  routineTemplateId?: string;
}

interface DatabaseSchema {
  students: Student[];
  studentDetails: Record<
    string,
    StudentDetail & {
      height?: number;
      bodyFat?: number;
      photoName?: string;
      scheduledChange?: ScheduledChange | null;
    }
  >;
}

async function ensureDb(): Promise<DatabaseSchema> {
  let data: DatabaseSchema;
  try {
    const fileContent = await fs.readFile(dbPath, "utf-8");
    data = JSON.parse(fileContent);
  } catch (error: any) {
    // If the file doesn't exist or is invalid, seed it
    const seedDetails: Record<string, any> = {};
    for (const s of MOCK_STUDENTS) {
      const detail = generateBaseDetail(s.id);
      if (detail) {
        seedDetails[s.id] = {
          ...detail,
          height: 165 + Math.floor(Math.random() * 20),
          bodyFat: 12 + Math.floor(Math.random() * 15),
          scheduledChange: null,
        };
      }
    }

    data = {
      students: MOCK_STUDENTS,
      studentDetails: seedDetails,
    };

    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
  }

  // --- AutoCron Check: Execute scheduled changes if due ---
  let hasChanges = false;
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  for (const student of data.students) {
    const detail = data.studentDetails[student.id];
    if (detail && detail.scheduledChange) {
      const change = detail.scheduledChange;
      if (change.executionDate <= todayStr) {
        // Apply Stage & StageNumber
        student.stage = change.stage;
        student.stageNumber = change.stageNumber;

        // Apply Diet Template
        if (change.dietTemplateId) {
          const template = DIET_TEMPLATES.find((t) => t.id === change.dietTemplateId);
          if (template) {
            detail.diet = {
              name: template.name,
              totalCalories: template.totalCalories,
              macros: template.macros,
              meals: template.meals,
            };
          }
        }

        // Apply Routine Template
        if (change.routineTemplateId) {
          const template = ROUTINE_TEMPLATES.find((t) => t.id === change.routineTemplateId);
          if (template) {
            detail.routine = {
              name: template.name,
              daysPerWeek: template.daysPerWeek,
              days: template.days,
            };
          }
        }

        // Clear scheduled change
        detail.scheduledChange = null;
        hasChanges = true;
        console.log(`[AutoCron] Applied scheduled change for student: ${student.name} (${student.id})`);
      }
    }
  }

  if (hasChanges) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
  }

  return data;
}

export async function getStudents(): Promise<Student[]> {
  const db = await ensureDb();
  return db.students.map((s) => {
    const detail = db.studentDetails[s.id];
    return {
      ...s,
      scheduledChange: detail ? detail.scheduledChange : null,
    } as any;
  });
}

export async function getStudentById(id: string): Promise<Student | null> {
  const db = await ensureDb();
  return db.students.find((s) => s.id === id) || null;
}

export async function getStudentDetail(id: string): Promise<(StudentDetail & { height?: number; bodyFat?: number; photoName?: string; scheduledChange?: ScheduledChange | null }) | null> {
  const db = await ensureDb();
  return db.studentDetails[id] || null;
}

export async function addStudent(
  student: Student,
  detail: StudentDetail & { height?: number; bodyFat?: number; photoName?: string; scheduledChange?: ScheduledChange | null }
): Promise<void> {
  const db = await ensureDb();
  db.students = [student, ...db.students];
  db.studentDetails[student.id] = detail;
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export async function updateStudent(
  id: string,
  studentUpdates: Partial<Student>,
  detailUpdates: Partial<StudentDetail & { height?: number; bodyFat?: number; photoName?: string; scheduledChange?: ScheduledChange | null }>
): Promise<void> {
  const db = await ensureDb();
  
  // Update student in students list
  db.students = db.students.map((s) => {
    if (s.id === id) {
      return { ...s, ...studentUpdates };
    }
    return s;
  });

  // Update details
  if (db.studentDetails[id]) {
    db.studentDetails[id] = { ...db.studentDetails[id], ...detailUpdates };
  } else {
    db.studentDetails[id] = {
      weightHistory: [],
      diet: { name: "Sin dieta", totalCalories: 0, macros: { protein: 0, carbs: 0, fat: 0 }, meals: [] },
      routine: { name: "Sin rutina", daysPerWeek: 0, days: [] },
      measurements: [],
      nextStageDate: null,
      notes: "",
      ...detailUpdates,
    };
  }

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export async function applyStageChange(
  studentIds: string[],
  changeData: {
    stage: any;
    stageNumber: number;
    dietTemplateId?: string;
    routineTemplateId?: string;
    executionDate?: string; // "YYYY-MM-DD" or empty/today
  }
): Promise<void> {
  const db = await ensureDb();
  const todayStr = new Date().toISOString().split("T")[0];
  const targetDate = changeData.executionDate || todayStr;

  for (const id of studentIds) {
    const student = db.students.find((s) => s.id === id);
    const detail = db.studentDetails[id];
    if (!student || !detail) continue;

    if (targetDate <= todayStr) {
      // Apply Immediately
      student.stage = changeData.stage;
      student.stageNumber = changeData.stageNumber;

      if (changeData.dietTemplateId) {
        const template = DIET_TEMPLATES.find((t) => t.id === changeData.dietTemplateId);
        if (template) {
          detail.diet = {
            name: template.name,
            totalCalories: template.totalCalories,
            macros: template.macros,
            meals: template.meals,
          };
        }
      }

      if (changeData.routineTemplateId) {
        const template = ROUTINE_TEMPLATES.find((t) => t.id === changeData.routineTemplateId);
        if (template) {
          detail.routine = {
            name: template.name,
            daysPerWeek: template.daysPerWeek,
            days: template.days,
          };
        }
      }

      // Clear any pending scheduled change
      detail.scheduledChange = null;
    } else {
      // Schedule for future
      detail.scheduledChange = {
        executionDate: targetDate,
        stage: changeData.stage,
        stageNumber: changeData.stageNumber,
        dietTemplateId: changeData.dietTemplateId,
        routineTemplateId: changeData.routineTemplateId,
      };
    }
  }

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}

export async function deleteStudents(ids: string[]): Promise<void> {
  const db = await ensureDb();
  const idSet = new Set(ids);
  db.students = db.students.filter((s) => !idSet.has(s.id));
  for (const id of ids) {
    delete db.studentDetails[id];
  }
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
}
