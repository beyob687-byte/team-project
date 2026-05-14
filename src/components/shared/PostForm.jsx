import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { eventsApi } from '../../api/events';
import { projectsApi } from '../../api/projects';
import { clubsApi } from '../../api/clubs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Checkbox from '../../components/ui/Checkbox';
import { toast } from '../../components/ui/Toast';
import { PlusCircle, Image, Video, Calendar, Folder, Hash } from 'lucide-react';

const PostForm = () => {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!postId;

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [visibility, setVisibility] = useState('public');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [linkedEventId, setLinkedEventId] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState('');

  // Poll specific states
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollMultipleChoice, setPollMultipleChoice] = useState(false);
  const [pollResultsVisibility, setPollResultsVisibility] = useState('after_close');
  const [pollExpiresAt, setPollExpiresAt] = useState('');

  // Fetch existing post data for editing
  const { data: existingPost, isLoading: isLoadingExistingPost } = useQuery({
    queryKey: ['postDetail', clubId, postId],
    queryFn: () => postsApi.getPost(clubId, postId),
    enabled: isEdit,
    onSuccess: (data) => {
      setContent(data.content);
      setPostType(data.post_type);
      setVisibility(data.visibility);
      setImages(data.images || []);
      setVideoUrl(data.video_url || '');
      setLinkedEventId(data.linked_event?.id || '');
      setLinkedProjectId(data.linked_project?.id || '');
      if (data.poll) {
        setPollQuestion(data.poll.question);
        setPollOptions(data.poll.options.map(opt => opt.option_text));
        setPollMultipleChoice(data.poll.multiple_choice);
        setPollResultsVisibility(data.poll.results_visibility);
        setPollExpiresAt(data.poll.expires_at ? new Date(data.poll.expires_at).toISOString().slice(0, 16) : '');
      }
    },
  });

  // Fetch club events and projects for linking
  const { data: eventsData } = useQuery({
    queryKey: ['clubEvents', clubId],
    queryFn: () => eventsApi.getEvents(clubId, { status: 'published' }),
  });
  const { data: projectsData } = useQuery({
    queryKey: ['clubProjects', clubId],
    queryFn: () => projectsApi.getProjects(clubId),
  });

  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => postsApi.createPost(clubId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['clubPosts', clubId]);
      toast.success('Post created successfully!');
      navigate(`/clubs/${clubId}/posts`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create post.');
      console.error(err);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: (data: any) => postsApi.updatePost(clubId, postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['postDetail', clubId, postId]);
      queryClient.invalidateQueries(['clubPosts', clubId]);
      toast.success('Post updated successfully!');
      navigate(`/clubs/${clubId}/posts/${postId}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update post.');
      console.error(err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', content);
    formData.append('post_type', postType);
    formData.append('visibility', visibility);
    if (videoUrl) formData.append('video_url', videoUrl);
    if (linkedEventId) formData.append('linked_event_id', linkedEventId);
    if (linkedProjectId) formData.append('linked_project_id', linkedProjectId);

    images.forEach((file) => {
      if (file instanceof File) { // Only append new File objects
        formData.append('images', file);
      }
    });

    if (postType === 'poll') {
      formData.append('question', pollQuestion);
      formData.append('poll_options', JSON.stringify(pollOptions.filter(opt => opt.trim() !== '')));
      formData.append('multiple_choice', pollMultipleChoice.toString());
      formData.append('results_visibility', pollResultsVisibility);
      if (pollExpiresAt) formData.append('expires_at', new Date(pollExpiresAt).toISOString());
    }

    if (isEdit) {
      updatePostMutation.mutate(Object.fromEntries(formData.entries())); // PATCH expects JSON, not FormData
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleImageChange = (e) => {
    setImages([...images, ...Array.from(e.target.files)]);
  };

  const addPollOption = () => setPollOptions([...pollOptions, '']);
  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  const removePollOption = (index) => {
    const newOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(newOptions);
  };

  if (isEdit && isLoadingExistingPost) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Post' : 'Create New Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              label="Post Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              required
            />

            <Select label="Post Type" value={postType} onChange={(e) => setPostType(e.target.value)} disabled={isEdit}>
              <option value="general">General Announcement</option>
              <option value="event_promotion">Event Promotion</option>
              <option value="project_highlight">Project Highlight</option>
              <option value="poll">Poll</option>
            </Select>

            <Select label="Visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public</option>
              <option value="members_only">Members Only</option>
            </Select>

            {postType === 'event_promotion' && (
              <Select label="Link to Event" value={linkedEventId} onChange={(e) => setLinkedEventId(e.target.value)}>
                <option value="">Select an event</option>
                {eventsData?.items?.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </Select>
            )}

            {postType === 'project_highlight' && (
              <Select label="Link to Project" value={linkedProjectId} onChange={(e) => setLinkedProjectId(e.target.value)}>
                <option value="">Select a project</option>
                {projectsData?.items?.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </Select>
            )}

            {postType === 'poll' && (
              <div className="space-y-4 p-4 border border-border-glow rounded-md">
                <h3 className="font-bold text-text-1 flex items-center gap-2"><Hash className="w-5 h-5" /> Poll Details</h3>
                <Input label="Poll Question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} required />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-2">Options</label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {pollOptions.length > 2 && (
                        <Button type="button" variant="outline" onClick={() => removePollOption(index)}>Remove</Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addPollOption}>Add Option</Button>
                </div>
                <Checkbox label="Allow Multiple Choices" checked={pollMultipleChoice} onChange={(e) => setPollMultipleChoice(e.target.checked)} />
                <Select label="Results Visibility" value={pollResultsVisibility} onChange={(e) => setPollResultsVisibility(e.target.value)}>
                  <option value="after_vote">After Vote</option>
                  <option value="always">Always</option>
                  <option value="after_close">After Close</option>
                </Select>
                <Input label="Poll Expires At (Optional)" type="datetime-local" value={pollExpiresAt} onChange={(e) => setPollExpiresAt(e.target.value)} />
              </div>
            )}

            <Input label="Images (Max 5)" type="file" multiple onChange={handleImageChange} accept="image/*" />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((file, index) => (
                  <img key={index} src={file instanceof File ? URL.createObjectURL(file) : file} alt={`Preview ${index}`} className="w-24 h-24 object-cover rounded-md" />
                ))}
              </div>
            )}

            <Input label="Video URL (YouTube/Vimeo link)" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />

            <Button type="submit" isLoading={createPostMutation.isLoading || updatePostMutation.isLoading}>
              {isEdit ? 'Save Changes' : 'Create Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;