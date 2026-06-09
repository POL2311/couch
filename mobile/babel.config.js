module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // En Expo SDK 54 (Reanimated 4) el plugin de "worklets" lo inyecta
    // automáticamente babel-preset-expo. El preset también transpila la
    // sintaxis moderna al nivel correcto para el Hermes del SDK 54.
  };
};
