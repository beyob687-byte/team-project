// Existing interfaces (if any) would go here.

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  // Add other user fields as needed
}

export interface LinkedEvent {
  id: string;
  title: string;
  // Add other event fields as needed
}

export interface LinkedProject {
  id: string;
  title: string;
  // Add other project fields as needed
}

export interface PollOption {
  id: string;
  option_text: string;
  vote_count: number | null; // null when hidden per visibility
  voted_by_me: boolean;
}

export interface Poll {
  id: string;
  question: string;
  multiple_choice: boolean;
  results_visibility: 'always' | 'after_vote' | 'after_close';
  total_votes: number | null; // null if results are not visible
  options: PollOption[];
}

export interface Post {
  id: string;
  club_id: string;
  author: UserProfile;
  post_type: 'general' | 'event_promotion' | 'project_highlight' | 'poll';
  content: string;
  images?: string[];
  video_url?: string;
  linked_event?: LinkedEvent;
  linked_project?: LinkedProject;
  poll?: Poll;
  visibility: 'public' | 'members_only';
  comments_count: number;
  created_at: string;
  moderation_status: string;
}

export interface Comment {
  id: string;
  user_id: string; // Assuming user_id is returned
  user_name: string; // Assuming CONCAT(u.first_name, ' ', u.last_name) as user_name
  content: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: any; // Can contain event_id, club_id etc.
  is_read: boolean;
  created_at: string;
}