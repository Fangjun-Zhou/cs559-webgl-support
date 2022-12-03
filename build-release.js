const { build } = require("esbuild");
const { dependencies, peerDependencies } = require("./package.json");
const { glsl } = require("esbuild-plugin-glsl");

const sharedConfig = {
  entryPoints: ["src/release.ts"],
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
      minify: false,
    }),
  ],
};

build({
  ...sharedConfig,
  outfile: "dist/release.js",
});
