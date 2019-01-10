const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios');
const usuarios = new Usuarios();
const {crearMensaje} = require('../utilidades/utilidades');

io.on('connection', (client) => {
    client.on('entrarChat', (data,callback) =>{
        console.log(data);
        if(!data.nombre || !data.sala){
            return callback({
                err: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        /*let personas =*/usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));

        callback(usuarios.getPersonasPorSala(data.sala));
        //console.log(usuario);
    });

    client.on('crearMensaje',(data) =>{
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje);
    });

    client.on('disconnect', () =>{
        let personaBorrada = usuarios.borrarPersona(client.id);
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Adiminstrador',`${personaBorrada.nombre} salió del chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));

    });

    //mensajes privados
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });
});