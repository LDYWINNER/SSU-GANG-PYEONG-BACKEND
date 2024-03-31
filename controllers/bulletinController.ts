import { Response } from "express";
import BulletinPost from "../models/BulletinPost";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";
import User from "../models/User";
import checkPermissions from "../utils/checkPermissions";
import BulletinPostComment from "../models/BulletinPostComment";
import { AuthRequest } from "../middleware/authenticateUser";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

const createBulletinPost = async (req: AuthRequest, res: Response) => {
  const { title, content, board, anonymity } = req.body;

  if (!title || !content || !board) {
    throw new BadRequestError("Please provide all values");
  }

  req.body.createdBy = req.user;
  req.body.anonymity = anonymity;

  const fetchUsername = async (userId: string) => {
    return User.findOne({ _id: userId }).then((user) => user?.username);
  };
  let username = await fetchUsername(req.user as string);
  req.body.createdByUsername = username;

  const post = await BulletinPost.create(req.body);

  res.status(StatusCodes.CREATED).json({ post });
};

const updateBulletinPost = async (req: AuthRequest, res: Response) => {
  try {
    const { _id, title, content, anonymity } = req.body;

    if (!title || !content) {
      throw new BadRequestError("Please provide all values");
    }

    await BulletinPost.findByIdAndUpdate(_id, {
      $set: {
        title,
        content,
        anonymity,
      },
    });

    res
      .status(StatusCodes.OK)
      .send({ message: "Bulletin Post updated successfully" });
  } catch (error) {
    console.log("error in updateBulletinPost", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in updating bulletin post" });
    throw error;
  }
};

interface IQueryObject {
  [x: string]: any;
  $and?: (
    | {
        $or: any;
      }
    | {
        board: any;
      }
  )[];
}

const getAllBulletinPosts = async (req: AuthRequest, res: Response) => {
  const { search, board } = req.query;

  if (board === "ALL" && search === undefined) {
    const bulletinAllPosts = await BulletinPost.find({});
    const bulletinTotalPosts = await BulletinPost.countDocuments(
      bulletinAllPosts
    );

    return res.status(StatusCodes.OK).json({
      bulletinAllPosts,
      bulletinTotalPosts,
    });
  } else if (board === "ALL" && search !== undefined) {
    const bulletinAllPosts = await BulletinPost.find({
      $or: [
        { content: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ],
    });
    const bulletinTotalPosts = await BulletinPost.countDocuments(
      bulletinAllPosts
    );

    return res.status(StatusCodes.OK).json({
      bulletinAllPosts,
      bulletinTotalPosts,
    });
  }

  let queryObject: IQueryObject = {
    board,
  };
  // content?: any; title?: any; board: any
  if (search) {
    queryObject = {
      $and: [
        {
          $or: [
            { content: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
          ],
        },
        { board },
      ],
    };
  }

  let result = BulletinPost.find(queryObject);
  result = result.sort("-createdAt");

  let bulletinAllPosts = await result;

  // exclude hate users
  const user = await User.findOne({ _id: req.user });

  if (user!.hateUsers.length > 0) {
    bulletinAllPosts = bulletinAllPosts.filter((post) => {
      return !user!.hateUsers.includes(post.createdBy as string);
    });
  }

  const bulletinTotalPosts = bulletinAllPosts.length;

  res.status(StatusCodes.OK).json({
    bulletinAllPosts,
    bulletinTotalPosts,
  });
};

const getSinglePost = async (req: AuthRequest, res: Response) => {
  const { id: postId } = req.params;

  const post = await BulletinPost.findOne({ _id: postId });

  if (!post) {
    throw new NotFoundError(`No post with id: ${postId}`);
  }

  let tempComments = await BulletinPostComment.find({ bulletin: postId });

  // exclude hate users
  const user = await User.findOne({ _id: req.user });

  if (user!.hateUsers.length > 0) {
    tempComments = tempComments.filter((comment) => {
      return !user!.hateUsers.includes(comment.createdBy as string);
    });
  }

  post.comments = tempComments as any;

  res.status(StatusCodes.OK).json({ post });
};

const deleteBulletinPost = async (req: AuthRequest, res: Response) => {
  const { id: postId } = req.params;

  const post = await BulletinPost.findOne({ _id: postId });

  if (!post) {
    throw new NotFoundError(`No post with id: ${postId}`);
  }

  checkPermissions(
    { userId: req.user } as {
      userId: string;
    },
    post.createdBy
  );

  //await post.remove();
  await BulletinPost.findByIdAndDelete(postId);

  res.status(StatusCodes.OK).json({ msg: "Success! Post removed" });
};

const likeBulletinPost = async (req: AuthRequest, res: Response) => {
  const { id: postId, like } = req.body;

  const post = await BulletinPost.findOne({ _id: postId });

  if (!post) {
    throw new NotFoundError(`No post with id: ${postId}`);
  }

  if (like) {
    if (post.likes.includes(req.user as string)) {
      const index = post.likes.indexOf(req.user as string);
      post.likes.splice(index, 1);
      const updatedPost = await BulletinPost.findOneAndUpdate(
        { _id: postId },
        { likes: post.likes }
      );
      res.status(StatusCodes.OK).json({ updatedPost });
    } else {
      post.likes.push(req.user as string);
      const updatedPost = await BulletinPost.findOneAndUpdate(
        { _id: postId },
        { likes: post.likes }
      );
      res.status(StatusCodes.OK).json({ updatedPost });
    }
  }
};

const createComment = async (req: AuthRequest, res: Response) => {
  const {
    params: { id: postId },
    body: { text, anonymity },
  } = req;

  const bulletinPost = await BulletinPost.findById(postId);

  if (!bulletinPost) {
    throw new NotFoundError(`No post with id: ${postId}`);
  }

  if (!text) {
    throw new BadRequestError("Please provide all values");
  }

  req.body.createdBy = req.user;
  req.body.bulletin = postId;

  const fetchUsername = async (userId: string) => {
    return User.findOne({ _id: userId }).then((user) => user?.username);
  };
  let username = await fetchUsername(req.user as string);
  req.body.createdByUsername = username;

  const comment = await BulletinPostComment.create(req.body);
  bulletinPost.comments.push(comment._id);
  bulletinPost.save();

  res.status(StatusCodes.CREATED).json({ comment });
};

const likeComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;

  const comment = await BulletinPostComment.findOne({ _id: commentId });

  if (!comment) {
    throw new NotFoundError(`No Comment with id: ${commentId}`);
  }

  if (comment.likes.includes(req.user as string)) {
    const index = comment.likes.indexOf(req.user as string);
    comment.likes.splice(index, 1);
    const updatedComment = await BulletinPostComment.findOneAndUpdate(
      { _id: commentId },
      { likes: comment.likes }
    );
    res.status(StatusCodes.OK).json({ updatedComment });
  } else {
    comment.likes.push(req.user as string);
    const updatedComment = await BulletinPostComment.findOneAndUpdate(
      { _id: commentId },
      { likes: comment.likes }
    );
    res.status(StatusCodes.OK).json({ updatedComment });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;

  const comment = await BulletinPostComment.findOne({ _id: commentId });

  if (!comment) {
    throw new NotFoundError(`No post with id: ${commentId}`);
  }

  checkPermissions(
    { userId: req.user } as { userId: string },
    comment.createdBy
  );

  // await comment.remove();
  await BulletinPostComment.findByIdAndDelete(commentId);

  await BulletinPost.findByIdAndUpdate(
    comment.bulletin,
    { $pull: { comments: commentId } },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ msg: "Comment removed successfully" });
};

const appDir = path.dirname(require.main?.filename as string);

const reportPostEmail = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  // console.log(id);

  const bulletinPost = await BulletinPost.findById(id);

  if (!bulletinPost) {
    throw new NotFoundError(`No post with id: ${id}`);
  }

  //send email to admin
  let emailTemplete;
  ejs.renderFile(
    appDir + "/template/reportPostMail.ejs",
    {
      type: "Bulletin Post",
      id: id,
      title: bulletinPost.title,
      content: bulletinPost.content,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      }
      emailTemplete = data;
    }
  );

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = await transporter.sendMail({
    from: `"SSUGANGPYEONG" <${process.env.NODEMAILER_USER}>`,
    to: process.env.REPORT_EMAIL,
    subject: "SSUGANGPYEONG Report",
    html: emailTemplete,
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    // console.log("Finish sending email : " + info.response);
    // console.log("loginEmailConfirmationNum : ", loginEmailConfirmationNum);

    res.send({ message: "Report email sent successfully" });
    transporter.close();
  });

  // send email to post creator
};

const reportCommentEmail = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const bulletinComment = await BulletinPostComment.findById(id);

  if (!bulletinComment) {
    throw new NotFoundError(`No post with id: ${id}`);
  }

  //send email to admin
  let emailTemplete;
  ejs.renderFile(
    appDir + "/template/reportCommentMail.ejs",
    {
      type: "Bulletin Comment",
      id: id,
      text: bulletinComment.text,
      post: bulletinComment.bulletin,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      }
      emailTemplete = data;
    }
  );

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = await transporter.sendMail({
    from: `"SSUGANGPYEONG" <${process.env.NODEMAILER_USER}>`,
    to: process.env.REPORT_EMAIL,
    subject: "SSUGANGPYEONG Report",
    html: emailTemplete,
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    // console.log("Finish sending email : " + info.response);
    // console.log("loginEmailConfirmationNum : ", loginEmailConfirmationNum);

    res.send({ message: "Report email sent successfully" });
    transporter.close();
  });

  // send email to post creator
};

const addHateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    console.log(user);
    const { hateId } = req.params;
    console.log(hateId);

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { [`hateUsers`]: hateId } },
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res
        .status(StatusCodes.OK)
        .json({ message: "Successfully added hate user" });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.log("error in addHateUser", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Error in Adding Hate User" });
    throw error;
  }
};

export {
  createBulletinPost,
  updateBulletinPost,
  deleteBulletinPost,
  getAllBulletinPosts,
  getSinglePost,
  likeBulletinPost,
  createComment,
  likeComment,
  deleteComment,
  reportPostEmail,
  reportCommentEmail,
  addHateUser,
};
