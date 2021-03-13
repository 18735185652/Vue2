
let oldArrayProtoMethods = Array.prototype;

// 不能直接改写数组原有的方法 不可靠，因为只有被vue控制的数组才需要改写

export let arrayMethods = Object.create(Array.prototype);

// arrayMethods.__proto__.push
let methods = [
    'push',
    'pop',
    'shift',
    'splice',
    'reverse',
    'sort'
]

methods.forEach(method => {
    arrayMethods[method] = function(...args){ // 重写数组方法
        // todo ... 
        let result = oldArrayProtoMethods[method].call(this,...args);
        console.log('todo: array change',);
       // 有可能用户新增的数据是对象格式 也要进行拦截
       let inserted;
       switch(method){
           case 'push':
           case 'unshilt':
                inserted = args
                break;
            case 'splice': // splice(0,1,xxx)
                inserted = args.slice(2);
            default :
                break;
       }
       
      if(inserted){ // observeArray
            this.__ob__.observeArray(inserted)
      }


       return result;
    }
})