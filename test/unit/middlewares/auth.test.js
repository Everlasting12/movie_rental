const mongoose = require("mongoose");
const { getAuthMiddleware } = require("../../../middleware/auth");

const { User } = require("../../../model/usersModel");

describe("getAuthMiddleware User Object Testing", () => {
  it("should populate req with the decoded payload", () => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      isAdmin: true,
    });

    const token = new User(user).getAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    getAuthMiddleware(req, res, next);
    expect(req.user).toHaveProperty("_id", user._id.toHexString());
    expect(req.user).toMatchObject(user.toJSON());
    expect(req.user).toHaveProperty("isAdmin", user.isAdmin);
  });
});
