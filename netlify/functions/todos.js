let todos = [
  {
    id: "8729",
    title: "FSE 2025 project",
    Description: "A digital health recording system that uses a QR-based emergency information delivery system.",
    Category: "Education",
    dueDate: "2026-01-10",
    completed: false
  },
  {
    id: "adcc",
    title: "gymWebsite",
    Description: "a website in Addis Ababa Which is owned by an individual with brand name Queen Marta Fitness Global",
    Category: "Work",
    dueDate: "2026-01-03",
    completed: false
  }
];

export async function handler(event) {
  const { httpMethod, path, body } = event;
  const id = path.split("/").pop();

  // GET
  if (httpMethod === "GET") {
    return response(200, todos);
  }

  // POST
  if (httpMethod === "POST") {
    const newTodo = JSON.parse(body);
    newTodo.id = crypto.randomUUID();
    todos.push(newTodo);
    return response(201, newTodo);
  }

  // PATCH
  if (httpMethod === "PATCH") {
    const updates = JSON.parse(body);
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    );
    return response(200, { success: true });
  }

  // DELETE
  if (httpMethod === "DELETE") {
    todos = todos.filter(todo => todo.id !== id);
    return response(200, { success: true });
  }

  return response(405, { error: "Method not allowed" });
}

function response(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  };
}
