const ora = require("ora");
const inquirer = require("inquirer");

const status = ora().start();

module.exports.migrate = async (tasks, taskID) => {

    status.info(`${tasks.length} migration tasks will be run ✊\n\n`);

    if (taskID) {
        tasks = tasks.splice(taskID, tasks.length);
    }

    let cancelled = false;
    
    for (const [index, task] of tasks.entries()) {
        
        status.start(task.name);

        const startAt = Date.now();
        
        const log = (msg) => status.start(task.name + ` | ${msg}`);

        const next = await task.execute(log).then(() => {
            status.succeed(`[${(index+1)+"/"+tasks.length}] ${task.name} 🎉 (${((Date.now()-startAt)/1000).toFixed(2)}s)`);
            return true;
        }).catch((e) => {

            console.error(e);

            status.stop();

            return inquirer.prompt([
                {
                    message: `${task.name} failed. Continue?`,
                    name: "confirm",
                    type: "confirm",
                    prefix: "❌",
                }
            ]).then((res) => res["confirm"]);
        });

        if (!next) {
            status.prefixText = "\n\n";
            status.info(`Only [${index}/${tasks.length}] tasks have been run 🤝`);
            cancelled = true;
            break;
        }
    }

    if (!cancelled) status.succeed("All the migration tasks have been completed successfull!");

};
