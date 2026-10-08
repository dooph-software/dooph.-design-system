// WI-C4-18: scale HeartFillIcon's 16-unit path by 1.5 onto the 24-unit grid.
// Arc commands scale rx, ry and the endpoint; rotation and flags are unchanged.
const d = "M15 6.375c0 4.375-6.487 7.916-6.763 8.063a.5.5 0 0 1-.474 0C7.487 14.291 1 10.75 1 6.375A3.879 3.879 0 0 1 4.875 2.5c1.291 0 2.42.555 3.125 1.493C8.705 3.055 9.834 2.5 11.125 2.5A3.879 3.879 0 0 1 15 6.375Z";
const k = 1.5, fmt = n => String(+(n * k).toFixed(4));
const out = [];
for (const [, cmd, args] of d.matchAll(/([MmCcAaZz])([^MmCcAaZz]*)/g)) {
  const nums = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
  if (/[Aa]/.test(cmd)) {
    const parts = [];
    for (let i = 0; i < nums.length; i += 7) parts.push([fmt(nums[i]), fmt(nums[i + 1]), nums[i + 2], nums[i + 3], nums[i + 4], fmt(nums[i + 5]), fmt(nums[i + 6])].join(' '));
    out.push(cmd + parts.join(' '));
  } else out.push(cmd + nums.map(fmt).join(' '));
}
console.log(out.join(''));
