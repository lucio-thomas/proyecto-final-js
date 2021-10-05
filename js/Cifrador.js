
class Cifrador {


  constructor(clave){
    this._clave = clave;
  }

  static generarClave(length) {
    length = length || 32;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  encriptar(text){

    let base64 = btoa(text);
    let fase1 = base64 + '-|-' + this._clave;
    let encriptado = btoa(fase1);

    return encriptado;
  }

  desencriptar(text){
    let fase1 = atob(text);
    let par = fase1.split('-|-');
    if(par[1] !== this._clave){
      throw new Error("Usuario invalido");
    }
    let base64 = par[0];
    let pass = atob(base64);

    return pass;
  }
}