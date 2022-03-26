const { Sequelize } = require("sequelize");
const db = require("../config/db.js");
const replyComment = require("./replyComment.js");
const Comment = require("./CommentModel.js");
const Follows = require("./FollowModel.js");
const postLikes = require("./PostLikes.js");
const Post = require("./PostModel.js");
const commentLike = require("./CommentLike.js");
const replyCommentLike = require("./ReplyCommentLike.js");

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    level_id: {
      type: DataTypes.INTEGER,
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: { msg: "No handphone sudah terdaftar" },
    },
    username: {
      type: DataTypes.STRING,
      unique: { msg: "Username sudah terdaftar" },
    },
    provider: {
      type: DataTypes.ENUM("phone", "google", "facebook", "tiktok"),
    },
    uid: {
      type: DataTypes.STRING,
      unique: { msg: "Uid sudah terdaftar" },
    },
    id_card: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: { msg: "Email sudah terdaftar" },
      // validate: {
      //   isEmail: { msg: "Format email salah" },
      // },
    },
    full_name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      validate: { isDate: { msg: "Format tanggal salah (yyyy-mm-dd)" } },
    },
    name_card: {
      type: DataTypes.STRING,
    },
    type_card: {
      type: DataTypes.STRING,
    },
    picture_card: {
      type: DataTypes.STRING,
    },
    profile_picture: {
      type: DataTypes.STRING,
    },
    brand_name: {
      type: DataTypes.STRING,
    },
    brand_domain: {
      type: DataTypes.STRING,
    },
    brand_image: {
      type: DataTypes.STRING,
    },
    is_active_brand: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  },
  { freezeTableName: true }
);

Users.hasMany(Post, { foreignKey: { allowNull: false } });
Post.belongsTo(Users);

Users.hasMany(Follows, {
  foreignKey: { name: "sender_id", allowNull: false },
}); // ngefollow
Users.hasMany(Follows, {
  foreignKey: { name: "receiver_id", allowNull: false },
}); // difollow
Follows.belongsTo(Users, { as: "sender", foreignKey: "sender_id" });
Follows.belongsTo(Users, { as: "follower", foreignKey: "sender_id" });
Follows.belongsTo(Users, { as: "following", foreignKey: "sender_id" });
Follows.belongsTo(Users, { as: "receiver", foreignKey: "receiver_id" });

Post.hasMany(postLikes);
postLikes.belongsTo(Post);
Users.hasMany(postLikes);
postLikes.belongsTo(Users);

// COMMENTS
Users.hasMany(Comment); // ngefollow

Post.hasMany(Comment); // difollow
Comment.belongsTo(Users);
Comment.belongsTo(Users);

// REPLY COMMENT
Users.hasMany(replyComment);
Users.hasMany(replyComment, {
  foreignKey: { name: "parentId", allowNull: false },
});
Comment.hasMany(replyComment, { as: "reply", foreignKey: "commentId" });
replyComment.belongsTo(Users);
replyComment.belongsTo(Users, { as: "parent", foreignKey: "parentId" });
replyComment.belongsTo(Comment);

// COMEMNT LIKE
Users.hasOne(commentLike);
commentLike.belongsTo(Users);
Comment.hasMany(commentLike);
commentLike.belongsTo(Comment);

// REPLY COMMENT LIKE
Users.hasOne(replyCommentLike);
replyCommentLike.belongsTo(Users);
replyComment.hasMany(replyCommentLike);
replyCommentLike.belongsTo(replyComment);

// Users.belongsToMany(Users, { through: "Followers", as: "followers" }); => belongs to many

module.exports = Users;
