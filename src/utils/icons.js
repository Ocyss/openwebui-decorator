await fetch(`https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/`).then(res=>res.json()).then(res=>res.files.reduce((acc,item)=>{
    if (item.contentType !== "image/svg+xml") return acc
  const fileName = item.path.split('/').pop().replace('.svg', '');
  const lastDashIndex = fileName.lastIndexOf('-');
  
  const mainName = lastDashIndex === -1 ? fileName : fileName.slice(0, lastDashIndex);
  const subName = lastDashIndex === -1 ? null : fileName.slice(lastDashIndex + 1);
  if (!acc[mainName]) acc[mainName] = {};
  if (subName) acc[mainName][subName] = true;
    return acc
},{}))