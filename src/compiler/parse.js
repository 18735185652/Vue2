const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 可以匹配到标签名 [0]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // [0] 标签的结束名字;
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// console.log(`style='color:"red"'`.match(attribute))
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;


//ast语法树
// let obj = {
//     tag:'div',
//     type:1,
//     attrs:[{styles:'color:red'}],
//     children:[
//         {
//             tag:'span',
//             type:1,
//             attrs:[],
//             children:[]
//         }
//     ],
//     props:null
// }
// vue3里面支持多个根元素(外层加了一个空元素) vue2只支持一个根节点

export function parseHTML(html) {
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: 1,
            chhidren: [],
            attrs,
            parent: null
        }
    }
    let root = null;
    let currentParent;
    let stack = []
    // 根据开始标签 结束标签 文本内容 生成一个ast语法树
    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs)
        if (!root) {
            root = element;
        }
        currentParent = element;
        stack.push(element);
    }
    function end(tagName) {
        let element = stack.pop();
        currentParent = stack[stack.length - 1]
        if (currentParent) {
            element.parent = currentParent;
            currentParent.chhidren.push(element);
        }
    }
    function chars(text) {
        text = text.replace(/\s/g, '');
        if (text) {
            currentParent.chhidren.push({
                type: 3,
                text
            })
        }
    }
    function advance(n) {
        html = html.substring(n);
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            let match = {
                tagName: start[1],
                attrs: [],
            }
            advance(start[0].length) // 获取元素
            // 查找属性
            let end, attr; // 不是开头标签结尾就一直解析
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {

                advance(attr[0].length)
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
            }
            if (end) {
                advance(end[0].length)
                return match
            }
        }

    }

    while (html) {
        let textEnd = html.indexOf('<');
        if (textEnd === 0) {
            let startTagMatch = parseStartTag();
            if (startTagMatch) {
                //    console.log('开始: ', startTagMatch.tagName);
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue;
            }
            //    console.log('startTagMatch: ', startTagMatch);
            // 结束标签
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                // console.log('结尾',endTagMatch[1]);
                end(endTagMatch[1])
                continue
            }
        }
        let text;
        if (textEnd > 0) { // 开始解析文本
            text = html.substring(0, textEnd);
        }
        if (text) {
            advance(text.length)
            // console.log('text',text);
            chars(text)
        }

    }
    return root
}