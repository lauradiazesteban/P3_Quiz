
const fs = require("fs");


//Nombre del fichero donde se guardan las preguntas
//Es un fichero de texto con JSON de quizzes
const DB_FILENAME = "quizzes.json";


/**
 * Modelo de datos.
 * En esta variable se mantienen todos los quizzes existentes
 * Es un arrat de objetos, donde cada objeto tiene los atributos question
 * y answer para guardar el texto de la pregunta y el de la respuesta.
 *
 * Al arrancar la app, esta variable contiene estas cuatro preguntas
 * pero  al final del modulo se llama a load() para cargar las preguntas
 * guardadas en el fichero DB_FILENAME.
 */
let quizzes =[
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "Paris"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    },

];
/**
 * Carga las preguntas guardadas en el fichero.
 *
 * Este metrodo carga el contenido del fichero DB_FILENAME en la variable
 * quizzes. El contenio de ese fichero esta en formato JSON.
 * La primera vez que se ejecute este metodo, el fichero DB_FILENAME no
 * existe, y se producira el error ENOENT. En este caso se salva el
 * contenido inical almacenado en quizzes.
 * Si se produce otro tipo de error, se lanza una excepcion que abortará
 * la ejecucion del programa.
 */
const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if (err){

            //La primera vez no existe el fichero
            if (err.code === "ENOENT"){
                save(); //Valores iniciales
                return;
            }
            throw err;

        }
        let json = JSON.parse(data);
        if(json){
            quizzes = json;
        }
    });

};
/**
 * Guarda las preguntas en el fichero.
 *
 * Guarda en formato JSON el valor de quizzes en el fichero DB_FILENAME.
 * Si se produce algun tipo de error, se lanza una excepcion que abortará
 * la ejecucion del programa.
 */
const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
        if(err) throw err;
        });

};

/**
 * Devuelve el numero total de preguntas existentes
 * @returns {number} numero total de pregutnas existentes
 */
exports.count = () => quizzes.lenght;

/**
 * Añade un nuevo quiz
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */
exports.add = (question, answer) => {
    quizzes.push({

        question: (question || "").trim(),
        answer: (answer ||"").trim()

    });
    save();
};
/**
 * Actualiza el quiz situado en la posicion index
 * @param id Clave que identifica el quiz a actualizar
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */
exports.update = (id, question, answer)=> {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error ('El valor del parametro id no es valido.');
    }
    quizzes.splice(id, 1, {

        question: (question || "").trim(),
        answer: (answer ||"").trim()

    });
    save();
};
/**
 * Devuelve todos los quizzes existentes
 * Devuelve un clon del valor guardado en la variable quizzes, es decir, devuelve un
 * objeto nuevo con todas las preguntas existentes
 * Para clonar quizzes se usa stringify + parse
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));


/**
 * Devuelve un clon del quiz almacenado en la posicion dada
 * Para clonar el quiz se una stringify + parse.
 * @param id Clave que identifica el quiz a devolver
 * @returns {question, answer} Devuelve el objeto quiz de la posicion dada
 */
exports.getByIndex = id => {
    const quiz = quizzes [id];
    if (typeof quiz ==="undefined"){
        throw new Error ('El valor del parametro id no es valido.');
    }
    return JSON.parse(JSON.stringify(quiz));
};
/**
 * Elimina el quiz situado en la posicion dada
 * @param id Clave que identifica el quiz a borrar
 */
exports.deleteByIndex = id => {
    const quiz = quizzes [id];
    if (typeof quiz ==="undefined"){
        throw new Error ('El valor del parametro id no es valido.');
    }
    quizzes.splice(id,1);
    save();
};

//Carga los quizzes almacenados en el fichero
load();