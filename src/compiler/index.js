import {parseHTML} from './parse'
import {generate} from './generate';

export function compileToFunctions(template){
   let ast = parseHTML(template)
    generate(ast); // ็ๆไปฃ็ 

}
