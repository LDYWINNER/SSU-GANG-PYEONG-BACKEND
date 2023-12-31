import { Response } from "express";
import BulletinPost from "../models/BulletinPost";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";
import User from "../models/User";
import checkPermissions from "../utils/checkPermissions";
import BulletinPostComment from "../models/BulletinPostComment";
import { AuthRequest } from "../middleware/authenticateUser";

const createBulletinPost = async (req: AuthRequest, res: Response) => {
  const { title, content, board, anonymity } = req.body;

  if (!title || !content || board === "-1") {
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

  const bulletinAllPosts = await result;

  const bulletinTotalPosts = await BulletinPost.countDocuments(queryObject);

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

  post.comments = await BulletinPostComment.find({ bulletin: postId });

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
  const { id: postId, like } = req.query;
  console.log(postId, like);

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
    body: { text },
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

  res.status(StatusCodes.OK).json({ msg: "Comment removed successfully" });
};

export {
  createBulletinPost,
  deleteBulletinPost,
  getAllBulletinPosts,
  getSinglePost,
  likeBulletinPost,
  createComment,
  likeComment,
  deleteComment,
};
