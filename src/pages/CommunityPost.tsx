import { useParams } from "react-router";

const CommunityPost = () => {
  const { postId } = useParams();

  console.log("CommunityPost postId:", postId);

  return <></>;
};

export default CommunityPost;
