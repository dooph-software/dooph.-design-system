const D={sm:16,rg:22,md:32,xl:40}, S={sm:2,rg:2.5,md:3,xl:3};
for (const k of Object.keys(D)) {
  const d=D[k], sw=S[k], r=(d-sw)/2, C=2*Math.PI*r, g=2*sw;
  const row=[];
  for (const p of [0.8,0.85,0.88,0.9,0.92,0.95,1]) {
    const a=C*p, tl=Math.max(0,C-a-2*g), to=tl+C-(a+g);
    row.push(`p=${p}: tl=${tl.toFixed(2)} dotAt=${(((a+g)%C)).toFixed(2)}`);
  }
  console.log(k, `C=${C.toFixed(2)} g=${g} clamp p>=${(1-2*g/C).toFixed(3)} dot-under-start p>=${(1-g/C).toFixed(3)}`);
  console.log('   ', row.join(' | '));
}
