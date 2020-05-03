(async function () {
  try {
    const exec = require("./util").exec;
    const fs = require("fs");

    fs.readdir("../", (err, files) => {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }

      const references = files
        .filter((file) => file !== "global" && file !== ".DS_Store")
        .map((package) => "../" + package + "/src/global");

      references.forEach(async (package) => {
        await exec(`rm -rf ${package}`);
        await exec(`cp -r ./dist ${package}`);
      });

      console.info("deployed to:", references);
    });
  } catch (error) {
    console.error(error);
  }
})();
