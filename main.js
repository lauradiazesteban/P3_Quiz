
const readline = require('readline');
const model = require('./model');
const {log, bigLog, errorLog, colorize} = require("./out");
const comandos = require ("./comandos");


//Mensaje inicial
bigLog('CORE QUIZ', 'blue');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize("quiz > ", 'green'),
    completer : (line) => {
    const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line];
}
});

rl.prompt();

rl
    .on('line', (line) => {

        let args = line.split(" ");
        let comando = args[0].toLowerCase().trim();

        switch (comando) {
            case '':
                rl.prompt();
                break;

            case 'h':
            case 'help':
                comandos.helpComando(rl);
                break;

            case 'quit':
            case 'q':
                comandos.quitComando(rl);
                break;

            case 'add':
                comandos.addComando(rl);
                break;

            case 'list':
                comandos.listComando(rl);
                break;

            case 'show':
                comandos.showComando(rl, args[1]);
                break;

            case 'test':
                comandos.testComando(rl, args[1]);
                break;

            case 'play':
            case 'p':
                comandos.playComando(rl);
                break;

            case 'delete':
                comandos.deleteComando(rl,args[1]);
                break;

            case 'edit':
                comandos.editComando(rl,args[1]);
                break;

            case 'credits':
                comandos.creditsComando(rl);
                break;

            default:
                console.log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
                console.log(`Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
                rl.prompt();
                break;
        }


    })
    .on('close', () => {
        log('Adiós');
        process.exit(0);
    });
