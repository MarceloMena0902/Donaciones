export const uploadImage = async (file: File) => {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("http://localhost:4000/api/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  return json.url;
};
