import { arrayMethods } from './array'
class Observer {
    constructor(value) { // 需要对这个value属性重新定义
        // this.data = value;
        // value 可能是对象 可能是数组 ，分类来处理
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false, // 不能被枚举 表示不能被循环
            configurable: false, // 不能删除此属性

        })
        if (Array.isArray(value)) {
            // 数组不用defineProperty来进行处理 性能不好
            // push shift reverse sort 我要重写这些方法增加更新逻辑
            value.__proto__ = arrayMethods; // 当是数组时候 改写方法是自己的           
            // Object.setPrototypeOf(value.protptype,arrayMethods)
            this.observeArray(value) //处理原有数组中的对象  Object.freeeze
        } else {
            this.walk(value);
        }
    }
    walk(data) {
        // 将对象中所有的key 重新用defineProperty 定义成响应式的
        Object.keys(data).forEach((key) => {
            defineReactive(data, key, data[key])
        })
    }
    observeArray(value) {
        for (let i = 0; i < value.length; i++) {
            observe(value[i])
        }
    }
}
function defineReactive(data, key, value) { // vue2中数据嵌套尽量不要过深 过深浪费性能
    // value 可能也是一个对象
    observe(value)
    Object.defineProperty(data, key, {
        get() {
            return value;
        },
        set(newValue) {
            if (newValue === value) return;
            observe(newValue) // 如果用户设置的是一个对象 就继续将用户设置的对象变成响应式的
            value = newValue
        }
    })
}

export function observe(data) {
    // 只对 对象类型进行观测 非对象类型无法观测
    if (typeof data !== 'object' || data == null) {
        return;
    }
    if (data.__ob__) { // 有ob属性说明被观测过了 防止循环引用
        return;
    }
    // 通过类来对实现数据的观测 类可以方便扩展 会产生实例
    return new Observer(data)
}