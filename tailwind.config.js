module.exports = {
  content: ["./src/**/*.{html,ts}"],
  daisyui: {
    themes: [
      {
        "carbon-gold": {
          "primary": "#D9A94A",
          "secondary": "#B98730",
          "accent": "#D9A94A",
          "neutral": "#2A2520",
          "base-100": "#171412",
          "base-200": "#201C18",
          "base-300": "#2A2520",
          "base-content": "#ECE6D9",
          "info": "#6C8FC9",
          "success": "#7FBB8A",
          "warning": "#D9A94A",
          "error": "#D98872",
        },
      },
    ],
    darkTheme: "carbon-gold",
  },
  plugins: [require("daisyui")],
};