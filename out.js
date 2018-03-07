

const figlet =  require('figlet');
const chalk = require('chalk');
/**
 * Dar color a un String
 * @param msg String al que damos color
 * @param color Color del que se pinta el msg
 * @returns {String} El String con el color indicado
 */
const colorize = (msg, color) => {
    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};
/**
 * Escribe un msg de log
 * @param msg String que tenemos que escribir
 * @param color Color del msg
 */
const log = (msg, color) => {
    console.log(colorize(msg, color));
};
/**
 * Escribe el mensaje de log en grande
 * @param msg Texto
 * @param color Color del texto
 */
const bigLog = (msg, color) => {
    log(figlet.textSync (msg, {horizontalLayout: 'full'}), color);
};
/**
 * Escribe el mensaje de error emsg
 * @param emsg Texto del mensaje de error
 */
const errorLog = (emsg) => {
    console.log(`${colorize('Error', 'red')}: ${colorize(colorize(emsg, 'red'), 'bgYellowBright')}`);
};

exports = module.exports = {
    colorize,
    log,
    bigLog,
    errorLog
};
