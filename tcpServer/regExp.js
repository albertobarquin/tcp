/**
 * Created by albertobarquin on 1/12/16.
 */
"use strict";
let regExp = function (str, regex){

    const regex = /git estatusPCK_EST([0-9A-Fa-f]*)PCK/g;
    const str = str ||`PCK_EST00271000002320PCK_DAT582ebf520800222022501db022101d8022001c30208019b+0+0+0+0+0+0+00000000160dce0000+000PCK_FIN`;
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    }

}

//const regex = /PCK_DAT([0-9A-Fa-f-*-.]*)PCK_FIN/g;
//const regex = /PCK_EST([0-9A-Fa-f]*)PCK/g;
//const str = `PCK_EST00271000002320PCK_DAT582ebf520800222022501db022101d8022001c30208019b+0+0+0+0+0+0+00000000160dce0000+000PCK_FIN`;
//(?:<UTS>.{8})(?:<ID>.{4})(?:<PID>.)((?:<Cod>([^0][^0]|[^0]0|0[^0])|)|00)(?:<AN>((.{4}){4}){1,2})(?:<SD>((\+|\-)((0|[1-9]\d*)\.\d+|0))+)\+(?:<Pul_1>.{4})(?:<Pul_2>.{4})(?:<Sens_temp>.{2})(?:<Bat>.{4})(?P<Humd>.{4})(?:<Temp>(\+|\-).{3})