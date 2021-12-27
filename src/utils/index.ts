const f = async (s) => {
 const arr = ['红灯亮2秒后', '黄灯亮2秒', '然后绿灯亮2秒']
 for (let i = 0, len = arr.length; i < Infinity; i++) {
  console.log(arr[i % len]);
  await new Promise(resolve => setTimeout(resolve, s))
 }
}

