const { build } = require("esbuild");
const { dependencies, peerDependencies } = require("./package.json");
const { glsl } = require("esbuild-plugin-glsl");

const sharedConfig = {
  entryPoints: ["src/editor.ts"],
  bundle: true,
  minify: false,
  sourcemap: true,
  watch: {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else console.log("watch build succeeded:", result);
    },
  },
  plugins: [
    glsl({
      minify: true,
    }),
  ],
};

build({
  ...sharedConfig,
  outfile: "dist/editor.js",
});
