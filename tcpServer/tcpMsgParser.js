'use strict'
//var a = parseInt('581c33d2', 16);


var _toInt = function(hex) {return parseInt(hex, 16);}
var _toDate = function (s) {return (new Date(s*1000)).toUTCString();}
var _hexToDate = function(hexMs) {return _toDate(_toInt(hexMs));}
var _endsWith = function (word, n){ return word.substr((word.length -n),n);}
var _firstParse = function(tramaRaw){


    var result = {err:'', trama:tramaRaw, end: false}

    // comprobamos la longitud de la cadena
    if (result.trama.length < 97){
        result.err +='Trama demasiado corta\n';

        return result;
    }

    //comprobamos si empieza por  PCK_DAT
    if ( result.trama.substr(0,7) === 'PCK_DAT'){
        result.trama = result.trama.substr(7,(tramaRaw.length-7))
    }

    //comprobamos si finaliza por end
    if(_endsWith(result.trama, 3) === 'END'){
        result.trama = result.trama.substr(0,(result.trama.length-3))
        result.end = true
    }

    //comprobamos si finaiza por  PCK_FIN
    if(_endsWith(result.trama, 7) === 'PCK_FIN'){
        result.trama = result.trama.substr(0,(result.trama.length-7))
    }
    else {
        result.err+='trama incompleta, no acaba en PCK_FIN\n';
        return result;
    }
    return result;
}

var _parse =function(trama){
    var tramaParseada = []

    tramaParseada[0] = _hexToDate (trama.substr(0,8));       //fecha
    tramaParseada[1] = _toInt(trama.substr(8,4));       //ID
    tramaParseada[2] = trama.substr(12,1);      //PID
    tramaParseada[3] = trama.substr(13,2);      //COD
    tramaParseada[4] = _toInt(trama.substr(15,4));     //AN1
    tramaParseada[5] = _toInt(trama.substr(19,4));     //AN2
    tramaParseada[6] = _toInt(trama.substr(23,4));     //AN3
    tramaParseada[7] = _toInt(trama.substr(27,4));     //AN4
    tramaParseada[8] = _toInt(trama.substr(31,4));     //AN5
    tramaParseada[9] = _toInt(trama.substr(35,4));     //AN6
    tramaParseada[10] = _toInt(trama.substr(39,4))     //AN7
    tramaParseada[11] = _toInt(trama.substr(43,4));    //AN8
    tramaParseada[12] = trama.substr(47,12);   //SD
    tramaParseada[13] = trama.substr(60,4);     //PUL 1
    tramaParseada[14] = trama.substr(64,4);     //PUL 2
    tramaParseada[15] = trama.substr(68,2);     //SENS TEMP
    tramaParseada[16] = trama.substr(70,4);     //BAT
    tramaParseada[17] = trama.substr(74,4)     //HUMD
    tramaParseada[18] = trama.substr(78,4);    //TEMP
    tramaParseada[19] = _toInt(trama.substr(0,8));       //fecha



    return tramaParseada;


}

var tramaRec = _firstParse('PCK_DAT582046520800222022401d5021e01dd022201c9020b01a1+0+0+0+0+0+0+00000000160ee20000+000PCK_FINEND')
if (tramaRec.err){console.log('Error: '+tramaRec.err)}
else {
    var trama = _parse(tramaRec.trama)

    console.debug (trama)



}












