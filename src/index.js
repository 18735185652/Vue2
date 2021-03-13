// Vue2.0 中就是一个构造函数 class
import {initMixin} from './init'

function Vue (options){
    console.log('options: ', options);
    this._init(options); // 当用户new Vue时,就调用init方法进行vue的初始方法

}

initMixin(Vue) //可以拆分逻辑到不同的文件中 更利于代码维护 模块化的概念


export default Vue;



// 库 => rollup 项目开发webpack