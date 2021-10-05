
console.log("Start Up");

const __q = ["usuario", "contraseña"];
const _datos = [];
const _reg = {};


pedirUsuario = function(callback){
  const usr ={};

  Noti.obtenerTexto("Usuario", (err, usuario) =>{
    if(usuario.isConfirmed){
      usr.usuario = usuario.value;
      return Noti.obtenerConstraseña((err, pass) =>{
      
        if(pass.isConfirmed){
          usr.contraseña = pass.value;
          return callback(null, usr);
        }
        return callback(new Error("Abort"));
      });
    }
    return callback(new Error("Abort"));
  });
}

let cifrador;
let db;

function iniciarDB(callback){
  // In the following line, you should include the prefixes of implementations you want to test.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

  if (!window.indexedDB) {
    const err = "Su browser no soporta una versión estable de IndexedDB. La herramienta de regiastro de contraseñas no podrá ser utilizado.";
    return callback(new Error(err));
  }

  var db;
  var request = window.indexedDB.open("reg-contraseñas");
  request.onerror = function(event) {
    const err = "Why didn't you allow my web app to use IndexedDB?!";
    return callback(new Error(err));
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    return callback(null, db);
  };

  // This event is only implemented in recent browsers
  request.onupgradeneeded = function(event) {
    // Save the IDBDatabase interface
    var db = event.target.result;

    // Create an objectStore for this database
    var sIdentidad = db.createObjectStore("identidad", { keyPath: "clave" });
    var sContenedor = db.createObjectStore("contenedor", { keyPath: "nombre" });
  };
  return db;
}

function obtenerClave(db, callback){
  const sIdentidad = db.transaction("identidad", "readwrite").objectStore("identidad");
  const cur = sIdentidad.openCursor();
  cur.onerror = function(event) {
      const err = "Error al iniciar";
      return callback(new Error(err));
    };
  cur.onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      pedirUsuario((err, usr) =>{
        if(err) {
          return callback(err);
        }
        usr.contraseña = new Cifrador("234drtwgrhnemkrgo").encriptar(usr.contraseña);
        if(usr.usuario === cursor.value.usuario && usr.contraseña === cursor.value.contraseña){
          Noti.ok("Ingreso correcto");
          return callback(null, cursor.value);  
        }
        return callback(new Error("Usuario o contraseña inválidos"));
      });
    }
    else {
      console.log("No hay más entradas!");
      let key = Cifrador.generarClave();
        alert("Registrese!");
      const usr = pedirUsuario((err, usr) =>{
        if(err) {
          return callback(err);
        }
        usr.clave = key;
        usr.contraseña = new Cifrador("234drtwgrhnemkrgo").encriptar(usr.contraseña);
        const sIdentidad = db.transaction("identidad", "readwrite").objectStore("identidad");
        var request = sIdentidad.add(usr);
        request.onsuccess = function(event) {
          Noti.ok("Usuario registrado");
          callback(null, { clave : key});
        };
        request.onerror = function(event) {
          const err = "Error al generar clave";
          return callback(new Error(err));
        };
      })
    }
  };
}

function guardarCredencial(db, callback, nombre, usuario, pass){
  const sContenedor = db.transaction("contenedor", "readwrite").objectStore("contenedor");
  const credencial = { nombre : nombre,
    u : usuario,
    p : cifrador.encriptar(pass)
  }
  var request = sContenedor.add(credencial);
  request.onsuccess = function(event) {
    callback();
  };
  request.onerror = function(event) {
    const err = "Error al generar clave";
    return callback(new Error(err));
  };
}

function revelarCredencial(db, nombre ,callback){
  const sIdentidad = db.transaction("contenedor", "readwrite").objectStore("contenedor");
  const cur = sIdentidad.get(nombre);
  cur.onerror = function(event) {
      const err = "Error al iniciar";
      return callback(new Error(err));
    };
  cur.onsuccess = function(event) {
    var cre = event.target.result;
    if (cre) {
      try{
        return callback(null, cifrador.desencriptar(cre.p));
      } catch(err){
        callback(err);
      }
    }

    callback();
  };
}

function listarCredenciales(db, callback){
  const lista = [];
  const sIdentidad = db.transaction("contenedor", "readwrite").objectStore("contenedor");
  const cur = sIdentidad.openCursor();
  cur.onerror = function(event) {
      const err = "Error al iniciar";
      return callback(new Error(err));
    };
  cur.onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      lista.push(cursor.value);
      cursor.continue();
    }
    else {
      return callback(null, lista);
    }
  };
}

iniciarDB((err, dbObj) => {
  if(err){
    return Noti.error(err, "Error");
  }

  db = dbObj;

  obtenerClave(db, (err, key) => {
    if(err){
      return Noti.error(err, "Error");
    }
    cifrador = new Cifrador(key.clave);
    listarCredenciales(db, (err, credenciales) =>{
      var str = "";
      for(var i in credenciales){
        str += "<tr data-nombre=\"" + credenciales[i]["nombre"] + "\">";
        for(p in credenciales[i]){
          if(p == "p"){
            str += "<td>*********</td>";
          } else {
            str += "<td>" + credenciales[i][p] + "</td>";
          }
        }
        str += "<td><button  class=\"btn btn-info\" onClick=\"revelar(this)\">revelar</button></td>"
        str += "</tr>";
      }

      $("#tbCredenciales").html(str);
    })
  });
});


function recargarListado(){
  listarCredenciales(db, (err, credenciales) =>{
    var str = "";
    for(var i in credenciales){
      str += "<tr class=\"table-light\" data-nombre=\"" + credenciales[i]["nombre"] + "\">";
      for(p in credenciales[i]){
        if(p == "p"){
          str += "<td>*********</td>";
        } else {
          str += "<td>" + credenciales[i][p] + "</td>";
        }
      }
      str += "<td><button onClick=\"revelar(this)\" class=\"btn btn-info\">revelar</button></td>"
      str += "</tr>";
    }

    $("#tbCredenciales").html(str);
  });
}

function revelar(evt){
  const btn = $(evt);
  const nombre = btn.parent().parent().data("nombre");
  const tdPass = btn.parent().parent().children()[2];

  revelarCredencial(db, nombre, (err, con) => {
    if(err){
      return Noti.error(err);
    }
    $(tdPass).html(con);
  });
}


const _valores = ["Nombre", "Usuario", "Password"];

function agregarClave(){
  var nombre= window.prompt("Ingrese " + _valores[0] + ":");
  var usuario= window.prompt("Ingrese " + _valores[1] + ":");
  var password= window.prompt("Ingrese " + _valores[2] + ":");
  
 
  const callback = () => {
    recargarListado();
}

  guardarCredencial(db, callback, nombre,usuario,password);
}





/*
pedirUsuario = function(callback){
  const usr ={};

  Noti.obtenerTexto("Usuario", (err, usuario) =>{
    if(usuario.isConfirmed){
      usr.usuario = usuario.value;
      return Noti.obtenerConstraseña((err, pass) =>{
      
        if(pass.isConfirmed){
          usr.contraseña = pass.value;
          return callback(null, usr);
        }
        return callback(new Error("Abort"));
      });
    }
    return callback(new Error("Abort"));
  });
}




function guardarCredencial(db, callback, nombre, usuario, pass){
  const sContenedor = db.transaction("contenedor", "readwrite").objectStore("contenedor");
  const credencial = { nombre : nombre,
    u : usuario,
    p : cifrador.encriptar(pass)
  }
  var request = sContenedor.add(credencial);
  request.onsuccess = function(event) {
    callback();
  };
  request.onerror = function(event) {
    const err = "Error al generar clave";
    return callback(new Error(err));
  };
}
*/













//Noti.error("Test : " + key)

// let usua = window.prompt("ingrese su nombre de usuario");
// const MENSAJE = "BIENVENID@ "

// if(usua !== ""){
//     alert(MENSAJE + usua)
// };


/*
const app = {};
app.__q = ["Nombre", "Apellido", "DNI", "Edad", "Carrera"];
app._datos = [];
app._reg = {};


app._pedirDato = function(qIdx){
    qIdx = qIdx || 0;
    const val = window.prompt("Ingrese " + app.__q[qIdx] + ":");
    app._reg[app.__q[qIdx]] = val;
    if(val == ""){
        alert("BIENVENIDO")
    }
}
*/ 