let todos = [];

exports.handler = async (event) => {
  const { httpMethod, path, body } = event;
  const id = path.split("/").pop();

  // GET
  if (httpMethod === "GET") {
    return json(200, todos);
  }

  // POST
  if (httpMethod === "POST") {
    const newTodo = JSON.parse(body);
    newTodo.id = Date.now().toString();
    todos.push(newTodo);
    return json(201, newTodo);
  }

  // PATCH
  if (httpMethod === "PATCH") {
    const updates = JSON.parse(body);
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
    return json(200, { success: true });
  }

  // DELETE
  if (httpMethod === "DELETE") {
    todos = todos.filter(todo => todo.id !== id);
    return json(200, { success: true });
  }

  return json(405, { error: "Method not allowed" });
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  };
}
