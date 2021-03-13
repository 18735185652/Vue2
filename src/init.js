import {initState} from './state'
import {compileToFunctions} from './compiler/index.js'
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options; // 实例上有个属性 $options，表示的是用户传入的所有参数
        initState(vm); //初始化状态

        if(vm.$options.el){ // 数据可以挂载到页面上
            vm.$mount(vm.$options.el);
        }
    }
    Vue.prototype.$mount = function(el){
        el = document.querySelector(el);
      
        const vm = this;
        const options = vm.$options;
       
        // 如果有render 就直接使用render
        // 没有render 看有没有template属性
        // 没有template 就接着找外部模版
        if(!options.render){
            let template = options.template; 
            if(!template && el){
                template = el.outerHTML;
               
            }
            // 如何将模版编译成render函数 
            const render = compileToFunctions(template);
            options.render = render;
        }
    }

}

