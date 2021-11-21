const file = __dirname + "/monkey.glb";

const fs = require("fs");

let buffer = fs.readFileSync(file).buffer;

const jsonLength = new Uint32Array(buffer.slice(12, 12 + 4))[0];

const { meshes, materials, accessors, bufferViews } = JSON.parse(
  new TextDecoder().decode(buffer.slice(20, 20 + jsonLength))
);

const groups = [];

buffer = buffer.slice(20 + jsonLength + 8);

const position = [];
const indices = [];
groups[-1] = {
  offset: 0,
  count: 0,
  byteLength: 0,
  totalVertexCount: 0,
};
let MIN = Array(3).fill(Infinity);
let MAX = Array(3).fill(-Infinity);

const extensions = new Set([]);

meshes[0].primitives.forEach((primitive, i) => {
  let color = [1, 1, 1];
  try {
    color = materials[primitive.material].pbrMetallicRoughness.baseColorFactor.slice(0, 3);
  } catch (err) {}

  let vertex = accessors[primitive.attributes.POSITION];
  MIN = MIN.map((a, i) => Math.min(a, vertex.min[i]));
  MAX = MAX.map((a, i) => Math.max(a, vertex.max[i]));
  const { byteLength, byteOffset } = bufferViews[vertex.bufferView];
  position.push(buffer.slice(byteOffset, byteOffset + byteLength));
  const index = accessors[primitive.indices];
  let bufferView = bufferViews[index.bufferView];
  const UintArray = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array }[index.componentType];
  if (UintArray === Uint32Array) extensions.add("OES_element_index_uint");
  indices.push(
    new UintArray(
      buffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
    ).map((x) => x + groups[i - 1].totalVertexCount)
  );
  groups[i] = {
    color,
    byteLength: bufferView.byteLength,
    indexCount: index.count,
    totalVertexCount: groups[i - 1].totalVertexCount + vertex.count,
    componentType: index.componentType,
    offset: groups[i - 1].offset + groups[i - 1].byteLength,
  };
});

delete groups[-1];
groups.forEach((color) => {
  delete color.byteLength;
  delete color.totalVertexCount;
});

// 包围球直径 / 包围盒对角线
let length = Math.hypot(...MAX.map((a, i) => a - MIN[i]));

const json = JSON.stringify({
  groups,
  length,
  position_length: position.reduce((a, b) => a + b.byteLength, 0),
  extensions: [...extensions],
});

const buffers = [
  new Uint32Array([json.length]).buffer,
  json,
  ...position,
  ...indices.map((a) => a.buffer),
].map((a) => Buffer.from(a));

fs.writeFileSync(file.replace(".glb", ".bin"), Buffer.concat(buffers));
// fs.appendFileSync()
