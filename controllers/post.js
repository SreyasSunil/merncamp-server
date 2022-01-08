import Post from "../models/post";
import cloudinary from "cloudinary";
import User from "../models/user";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export const createPost = async (req, res) => {
    const { content, image } = req.body;
    if (!content.length) {
        return res.json({
            error: "Content is required",
        });
    }
    // console.log("post ==>", req.body);
    try {
        const post = new Post({ content, image, postedBy: req.user._id });
        await post.save();

        const postWithUser = await Post.findById(post._id).populate(
            "postedBy",
            "-password -secret"
        );
        res.json(postWithUser);
    } catch (err) {
        console.log(er);
        res.sendStatus(400);
    }
};

export const uploadImage = async (req, res) => {
    // console.log("req files ==> ", req.files);
    try {
        const result = await cloudinary.uploader.upload(req.files.image.path);
        // console.log("Image url ==>", result);
        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        console.log(err);
    }
};
export const postsByUser = async (req, res) => {
    try {
        // const posts = await Post.find({ postedBy: req.user._id })
        const posts = await Post.find()
            .populate("postedBy", "_id name image")
            .sort({ createdAt: -1 })
            .limit(10);
        // console.log("posts ==>", posts);
        res.json(posts);
    } catch (err) {
        console.log(err);
    }
};

export const userPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params._id)
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image");
        res.json(post);
        // console.log('post ==>',post);
    } catch (err) {
        console.log(err);
    }
};

export const updatePost = async (req, res) => {
    // console.log("post updated controller ==>", req.body);
    try {
        const post = await Post.findByIdAndUpdate(req.params._id, req.body, {
            new: true,
        });
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};

export const deletePost = async (req, res) => {
    // console.log("Post is deleted");
    try {
        const post = await Post.findByIdAndDelete(req.params._id);
        //remove image from cloudinary
        if (post.image && post.image.public_id) {
            const image = await cloudinary.uploader.destroy(
                post.image.public_id
            );
        }
        res.json({ ok: true });
    } catch (err) {
        console.log(err);
    }
};

export const newsFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        let following = user.following;
        following.push(req.user._id);
        // pagination
        const perPage = 3;
        const currentPage = req.params.page || 1;

        const posts = await Post.find({ postedBy: { $in: following } })
            .skip((currentPage - 1) * perPage)
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image")
            .sort({ createdAt: -1 })
            .limit(perPage);

        res.json(posts);
    } catch (err) {
        console.log(err);
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.body._id,
            {
                $addToSet: { likes: req.user._id },
            },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};
export const dislikePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.body._id,
            {
                $pull: { likes: req.user._id },
            },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};

export const addComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { comments: { text: comment, postedBy: req.user._id } },
            },
            { new: true }
        )
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image");
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};
export const removeComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: { comments: { _id: comment._id } },
            },
            { new: true }
        );
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};

export const totalPosts = async (req, res) => {
    try {
        const total = await Post.find().estimatedDocumentCount();
        res.json(total);
    } catch (err) {
        console.log(err);
    }
};

export const posts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image")
            .sort({ createdAt: -1 })
            .limit(12);
        res.json(posts);
    } catch (err) {
        console.log(err);
    }
};

export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params._id)
            .populate("postedBy", "_id name image")
            .populate("comments.postedBy", "_id name image");
        res.json(post);
    } catch (err) {
        console.log(err);
    }
};
