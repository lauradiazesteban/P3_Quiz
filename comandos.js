const Sequelize = require('sequelize');
const {log, bigLog, errorLog, colorize} = require("./out");


//sacamos models de sequelize
const {models} = require('./model');

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

//models son los modelos de la base de datos y vamos a .quizz que es la definicion del modelo
// que a mi me interesa y llamamos a findAll() que es una promesa que cuando se cumpla
// me devolverá todos los quizzes existentes
   models.quiz.findAll()
   //registramos con .then la funcion que quiero ejecutar que toma como parametro
   //todos los quizzes que me devuelve findAll()
   //.then(quizzes => {
   //cogemos el array de los quizzes e itero sobre ellos. En cada iteracion me van dando
   //un quiz
   //quizzes.forEach(quiz => {
   //Lo anterior se puede simplificar por esto
       .each(quiz => {
           //Log del identificador que es el campo id del quiz que yo tengo
           log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);

       })
       //por si hay errores
       .catch(error => {
           errorLog(error.message);
       })

       // este .then() haya pasado lo que haya pasado vuelve a darme el rl.prompt() el cual no sacamos
       //hasta que no se hayan terminado todas las promesas anteriores
       .then (() => {
           rl.prompt();
       });
};
//valida el id que me han pasado como parametro.

const validateId = id => {
    //Objeto Promesa
    return new Sequelize.Promise ((resolve, reject) =>{
        //mira si el valor esta indefinido
        if (typeof id === "undefined"){
            //Lo rechaza
            reject (new Error (`Falta el parametro <id>.`));
        }else {
            //Cambia el id por un numero
            id = parseInt(id);
            //Si no es un numero lo rechazo
            if (Number.isNaN(id)){
                reject (new Error (`El valor del parametro <id> no es un numero.`))
            }else{
                //se resuelve la promesa con el id que yo quiero y me lo devuelve
                resolve(id);
            }
        }
    });

};
/*
 * Muestra el quiz indicado en el parametro: pregunta y respuesta
 * @param rl  Objeto readline usado para implemetar el CLI
 * @param id Clave del quiz a mostrar
 */
exports.showComando = (rl, id) => {
    //llamamos a una funcion validateId() con el id de parametro que nos devuelve una promesa y si se cumple
    validateId(id)
        //cojo el id que me ha dado la validacion y
        // en mi modelo de datos me voy a mi modelo quiz y busco un quiz por su id
        .then(id => models.quiz.findById(id))
        // una vez que se ha terminado la promesa anterior compruebo si realmente me han pasdo un quiz
        .then(quiz =>{
            if (!quiz){
                //si no hay un quiz lanzamos un error
                throw new Error (`No existe un quiz asociado al id=${id}.`);
            }
            //si si lo es mostramos el id con su pregunta y respuesta
            log (`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        //si alguna de las promesas anterioriores genera un error lanzamos el siguiente catch
        .catch(error => {
            errorLog(error.message);
        })
        // haya pasado lo que haya pasado este .then() saca el prompt()
        .then(()=> {
            rl.prompt();
        });

};
/**
 * Esta funcion devuelve una promesa que cuando se cumple, proporciona el texto
 * Entonces la llamada a then que hay que hacer la promesa devuelta sera:
 * .then(answer=>{...})
 *
 * Tambien colorea en rojo el texto de la pregunta, elimina espacios al principio y al final trim()
 * @param rl Objeto readLine usado para implementar el CLI.
 * @param text Pregunta que hay que hacerle al usuario
 * @returns {Promise<any>}
 */
const makeQuestion = (rl, text) =>{
    return new Sequelize.Promise ((resolve, reject)=> {
        //llamamos a rl.question con el texto que voy a hacer la pregunta y espero la respuesta
        rl.question(colorize(text, 'red'), answer =>{
            //para transformarlo en una promesa llamamos en el callback a resolver
            resolve(answer.trim());
        });
    });
};

/**
 * Añade un nuevo quiz al modelo
 * Pregunta interactivamente por la pregunta y por la respuesta
 * @param rl Objeto readline usado para implemetar el CLI
 */
exports.addComando = rl => {
    //promesa que el usuario no introduzca un texto a esa pregunta no va a terminar
    makeQuestion(rl, 'Introduzca una pregunta: ')
        //toma como parametro el texto de la pregunta que ha introducido el usuario
        .then(q => {
            // creo una pregunta para introducir el texto de la respuesta que cuando se cumpla en a me pasaran el texto de la pregunta
            return makeQuestion(rl, 'Introduzca la respuesta ')
                .then(a =>{
                    //con q y a creo un objeto quiz
                    return {question: q, answer: a};
                });
        })
        //la promesa anterior termina devolviendo la makeQuestion y lo pasa a este then con quiz
        .then (quiz =>{
            //nos vamos al modelo de la base de datos y llamamos a create con el objeto que quiero crear
            //en la tabla de la base de datos
            return models.quiz.create(quiz);
        })
        //si lo anterior se puede hacer pasamos a este then con el quiz creado en la base de datos
        .then((quiz) =>{
            //saca el mensaje de log diciendo que se ha creado una pregunta con una respueta
        log (`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
        //Si hay algun problema pasamos a este catch. Esta es por si hay un error de validacion
        .catch(Sequelize.ValidationError, error => {
            errorLog('El quiz es erroneo: ');
            //me pasan a error el error que se ha producido recorriendo el array con todos los errores que hayan podido producirse
            error.errors.forEach(({message}) => errorLog(message));
        })
        //Si hay algun otro problema pasamos a este catch. Por ejemplo que no sea unico el texto
        .catch(error =>{
            errorLog(error.message);
        })
        .then(() =>{
            rl.prompt();
        });
};
/**
 * Borra un quiz del modelo
 * @param rl Objeto readline usado para implemetar el CLI
 * @param id Clace del quiz a borrar
 */
exports.deleteComando = (rl,id) => {
    //hacemos esta promesa para validar el id que me pasan como parametro
    validateId(id)
        //si se cumple la promesa anterior metemos ese id en este then()
        // para destruir el elemento que tenga el id que hemos pasado como paramtero
        .then(id =>models.quiz.destroy({where: {id}}))
        .catch(error =>{
            errorLog(error.message);
        })
        .then(() =>{
            rl.prompt();
        });

};

/**
 * Edita un quiz del modelo
 *  @param rl  Objeto readline usado para implemetar el CLI
 *  @param id Clave del quiz a mostrar
 */
exports.editComando = (rl, id) => {
    //validamos el id
    validateId(Id)
    //Buscamos por su id la pregunta que quiero editar
        .then(id => models.quiz.findById(id))
        //parametro== el quiz que ha encontrado asociado a ese id
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            // Editamos con makeQuestion para editar el texto de la pregunta y de la respuesta
            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            }, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer)
                    }, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            //Devolcemos el objeto quiz nuevo que a mi me interesa
                            return quiz;
                        });

                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error =>{
            errorLog('El quiz es erroneo: ');
            error.errors.forEach(({message}) => errorLog(message));
        })
        .catch(error =>{
            errorLog(error.message);
        })
        .then(() => {
            rl.prompt()
        });

};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.testComando = (rl,id) => {
    //validarId, acceder a la base de datos como haciamos en editar y preguntar por la pregunta asociada al quiz que hemos recuperado

    if (typeof id === "undefined") {
        //Valido el id como en el método editCmd.
        validateId(id)
        //Buscamos por su id la pregunta que quiero editar
            .then(id => models.quiz.findById(id))
            //parametro== el quiz que ha encontrado asociado a ese id
            .then(quiz => {
                if (!quiz) {
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                //Hago la pregunta y si me la devuelve, la respuesta la comparo para ver si es correcta.
                return makeQuestion(rl, ` ¿ ${colorize(quiz.question, 'magenta')} ?`)
                    .then(a => {
                        if (a.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                            log('Su respuesta es correcta.');
                            bigLog('CORRECTO', 'green');

                        } else {
                            log('Su respuesta es incorrecta.');
                            bigLog('INCORRECTO', 'red');
                        }
                    });
            })
            .catch(Sequelize.ValidationError, error => {
                errorLog('El quiz es erróneo:');
                error.errors.forEach(({message}) => errorLog(message));
            })
            .catch(error => {
                errorLog(error.message);
            })
            .then(() => {
                rl.prompt();
            });
    };
    /**
     * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
     * Se gana si se contesta a todos satisfactoriamente.
     *
     * @param rl Objeto readline usado para implementar el CLI.
     */
    exports.playComando = rl => {
        //cargar inicialmente en un array todas las preguntas que hay segun las vamos preguntarlas de forma aleatoria eliminarlas del arrat
        //orientarlo a promesas

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

        models.quiz.findAll()
            .each(quiz => {
                toBeResolved.push(quiz.id);

            })
            .then(() => {
                playOne();
            });

        //Función jugar otra pregunta más. Función recursiva.
        const playOne = () => {

            //Si no hay ninguna más por resolver, se termina con el rl.prompt()
            if (toBeResolved.length === 0) {

                //Sacamos mensaje diciendo que no hay nada más que preguntar.
                log(` No hay nada más que preguntar.`);

                //Sacamos la puntación. El numero de aciertos.
                log(` Fin del juego. Aciertos: ${score} `);
                bigLog(` ${score}`, 'magenta');

                //Para que el usuario meta otro comando.
                rl.prompt();

            } else {
                //Tengo que ir a por la posición del toBeResolved "final", dado que se irá modificando a medida que se vayan eliminando quizzes.
                let pos = Math.floor(Math.random() * toBeResolved.length);
                let id = toBeResolved[pos];
                //Vamos a validar el id que hemos obtenido aleatoriamente.
                validateId(id)
                    .then(id => models.quiz.findById(id))
                    .then(quiz => {
                        if (!quiz) {
                            throw new Error(`No existe un quiz asociado al id=${id}`);
                        }
                        //Voy a preguntar la pregunta asociada al id escogido aleatoriamente.
                        //Hago la pregunta y si me la devuelve, la respuesta la comparo para ver si es correcta.
                        return makeQuestion(rl, ` ¿${colorize(quiz.question, 'magenta')}? `)
                            .then(a => {
                                if (a.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                                    score = score + 1;
                                    //Y la quitamos del array, porque ya se habrá contestado.
                                    //Por ejemplo, si hacemos toBeResolved.splice(3,1), dejaría el array como "0 1 2 4"
                                    //No podemos usar model.deleteByIndex() porque afecta al json de las preguntas
                                    //y la eliminaríamos de ahí.
                                    toBeResolved.splice(pos, 1);
                                    log(` CORRECTO - Lleva ${score} aciertos`);
                                    //Llamada recursiva a playOne para que vuelva a jugar otra pregunta.
                                    playOne();

                                } else {
                                    log(` INCORRECTO.`);
                                    log(` Fin del juego. Aciertos: ${score} `);
                                    bigLog(` ${score}`, 'magenta');
                                }

                            });
                    })
                    .catch(Sequelize.ValidationError, error => {
                        errorLog('El quiz es erróneo:');
                        error.errors.forEach(({message}) => errorLog(message));
                    })
                    .catch(error => {
                        errorLog(error.message);
                    })
                    .then(() => {
                        rl.prompt();
                    });
            }
        };

        //Para que empieze el proceso. Aquí la llamo. Arriba, solo estaba definida.
        //playOne();
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

    exports.quitCmd = rl => {
        rl.close();
    };
};



