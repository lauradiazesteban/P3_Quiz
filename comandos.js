const {log, bigLog, errorLog, colorize} = require("./out");
const model = require('./model');

/**
 * Muestra la ayuda
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.helpComando = rl  => {
    log(" Comandos");
    log(" h|help - Muestra esta ayuda.");
    log(" List - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un uevo quizz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo
 * @param rl Objeto readline usado para implemetar el CLI
 */
exports.listComando = rl => {
   model.getAll().forEach((quiz,id) => {
       log(`  [${ colorize(id, 'magenta')}]: ${quiz.question} `);

   });
    rl.prompt();
};
/**
 * Muestra el quiz indicado en el parametro: pregunta y respuesta
 * @param rl  Objeto readline usado para implemetar el CLI
 *  @param id Clave del quiz a mostrar
 */
exports.showComando = (rl, id) => {

    if (typeof id === "undefined"){
        errorLog(`Falta el parametro id.`);
    }else {
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        }catch (error){
            errorLog(error.message);
        }
    }
    rl.prompt();
};
/**
 * Añade un nuevo quiz al modelo
 * Pregunta interactivamente por la pregunta y por la respuesta
 * @param rl Objeto readline usado para implemetar el CLI
 */
exports.addComando = rl => {
    rl.question(colorize('Introduce una pregunta: ', 'red'), question =>{
        rl.question(colorize('Introduce la respuesta: ', 'red'), answer =>{
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta' )} ${answer}`);
            rl.prompt();

        });
    });
};
/**
 * Borra un quiz del modelo
 * @param rl Objeto readline usado para implemetar el CLI
 * @param id Clace del quiz a borrar
 */
exports.deleteComando = (rl,id) => {
    if (typeof id === "undefined"){
        errorLog(`Falta el parametro id.`);
    }else {
        try{
            model.deleteByIndex(id);
        }catch (error){
            errorLog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita un quiz del modelo
 *  @param rl  Objeto readline usado para implemetar el CLI
 *  @param id Clave del quiz a mostrar
 */
exports.editComando = (rl, id) => {
    if (typeof id === "undefined") {
        errorLog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{

            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });



        } catch (error) {
            errorLog(error.message);
            rl.prompt();
        }
    }
};



/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.testComando = (rl,id) => {

    if (typeof id === "undefined") {
        errorLog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{

            const quiz = model.getByIndex(id);
            rl.question(colorize(' ¿ '  + quiz.question + ' ? ', 'red'), respuesta => {

                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log('Su respuesta es');
                    bigLog('CORRECTO', 'green');

                }else{
                    log('Su respuesta es');
                    bigLog('INCORRECTO', 'red');
                }
                rl.prompt();
            });

        } catch (error) {
            errorLog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playComando = rl => {

    let score = 0; //Numero de preguntas acertadas
  /*
    let toBeResolved = []; //Array con ids de las preguntas y asi no repetir preguntas

    const quizzes = model.getAll();
    for (i = 0; i < quizzes.length; i++) {
        toBeResolved[i] = quizzes[i];
        //
    }
    */
    let toBeResolved = model.getAll();


    //Función para jugar  más
    const playOne = () => {
        //Si no hay ninguna más por resolver
        if (toBeResolved.length === 0) {
            log(` No hay nada más que preguntar.`);
            log(` Fin del juego. Aciertos: ${score} `);
            bigLog(` ${score}`, 'magenta');
            rl.prompt();
        } else {
            //Cogemos pregunta al azar del array toBeResolved usando Math.random().
            //Con esta funcion, multiplico por el tamaño del array, y así me da numero
            //aleatorio que va desde 0 hasta el tamaño maximo del array. En esa posicion
            //tendré el id que a mi me interesa. Redondeo
            let id = Math.floor(Math.random()*toBeResolved.length);
            //Voy a preguntar la pregunta asociada al id escogido aleatoriamente.
            let quiz = toBeResolved[id];
            toBeResolved.splice(id, 1);

            //Voy a hacer una pregunta del quiz que yo tengo, como en testComando() y
            //voy a mirar si es correcta.
            rl.question(colorize(' ¿ ' + quiz.question + ' ? ', 'red'), answer => {

                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    score = score +1 ;
                    log(` CORRECTO - Lleva ${score} aciertos`);
                    //le restamos uno al array para no repetir las preguntas
                    //Llamada recursiva a playOne para que vuelva a jugar otra pregunta.
                    playOne();
                } else {
                    log(` INCORRECTO.`);
                    log(` Fin del juego. Aciertos: ${score} `);
                    bigLog(` ${score}`, 'magenta');
                    rl.prompt();
                }
            });
        }
    };
    playOne();
};
/**
 * Muestra los nombres de los autores
 * @param rl Objeto readline usado para implemetar el CLI
 */
exports.creditsComando = rl => {
    log('Autores de la práctica:');
    log('Alejandra Fiol de Nicolás', 'green');
    log('Laura Diaz', 'green');
    rl.prompt();
};

/**
 * Terminar el programa
 * @param rl Objeto readline usado para implemetar el CLI
 */
exports.quitComando = rl=> {
    rl.close();

};



