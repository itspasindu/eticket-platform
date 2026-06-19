const pythonBaseUrl = (
  process.env.PYTHON_API_URL ||
  process.env.PYTHON_SERVICE_URL ||
  "http://127.0.0.1:5001"
).replace(/\/$/, "");

const forwardJson = async (res, targetPath, method = "GET", body) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${pythonBaseUrl}${targetPath}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return res.status(response.status).json(payload);
  } catch (error) {
    const isTimeout = error.name === "AbortError";
    return res.status(502).json({
      message: isTimeout
        ? "Python service timeout"
        : "Python service unavailable",
      error: error.message,
    });
  }
};

const chat = async (req, res) => {
  return forwardJson(res, "/chat", "POST", req.body);
};

const generateDescription = async (req, res) => {
  return forwardJson(res, "/generate-description", "POST", req.body);
};

const similarRecommendations = async (req, res) => {
  const { eventId } = req.params;
  return forwardJson(res, `/recommendations/similar/${eventId}`);
};

const personalizedRecommendations = async (req, res) => {
  const { userId } = req.params;
  return forwardJson(res, `/recommendations/personalized/${userId}`);
};

module.exports = {
  chat,
  generateDescription,
  similarRecommendations,
  personalizedRecommendations,
};
