import ApiResponseHandler from "../apiResponseHandler";
import NewsService from "../../services/newsService";

export default async (req, res) => {
  try {
    const payload = await NewsService.list(req.query);
    await ApiResponseHandler.success(req, res, payload);
  } catch (error) {
    await ApiResponseHandler.error(req, res, error);
  }
};
