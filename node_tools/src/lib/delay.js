var delay = function delay(time) {
  return new Promise((resolve, reject)=>{
    setTimeout(()=>resolve(), time);
  });
}

module.exports = delay;
