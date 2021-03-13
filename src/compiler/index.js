import {parseHTML} from './parse'
import {generate} from './generate';

export function compileToFunctions(template){
   let ast = parseHTML(template)
    generate(ast); // 生成代码

}
