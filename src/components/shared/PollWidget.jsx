import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollsApi } from '../../api/polls';
import { toast } from '../ui/Toast';
import { CheckCircle, Radio, Square } from 'lucide-react';
import Button from '../ui/Button';

const PollWidget = ({ clubId, postId, initialPoll }) => {
  const queryClient = useQueryClient();
  const [selectedOptions, setSelectedOptions] = useState([]);

  const { data: pollData, isLoading, isError, refetch } = useQuery({
    queryKey: ['pollResults', clubId, postId],
    queryFn: () => pollsApi.getPollResults(clubId, postId),
    initialData: initialPoll, // Use initial data from post object
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  useEffect(() => {
    if (pollData?.options) {
      const voted = pollData.options.filter(opt => opt.voted_by_me).map(opt => opt.id);
      setSelectedOptions(voted);
    }
  }, [pollData]);

  const voteMutation = useMutation({
    mutationFn: ({ optionId }: { optionId: string }) => pollsApi.votePoll(clubId, postId, optionId),
    onSuccess: () => {
      toast.success('Vote submitted!');
      refetch(); // Refetch poll results to show updated state
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit vote.');
      console.error(err);
    },
  });

  const handleOptionClick = (optionId: string) => {
    if (voteMutation.isLoading) return;

    if (pollData.multiple_choice) {
      // Toggle selection for multiple choice
      const newSelection = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
      setSelectedOptions(newSelection);
    } else {
      // Select single option
      setSelectedOptions([optionId]);
    }
    voteMutation.mutate({ optionId });
  };

  if (isLoading) return <div className="text-text-2">Loading poll...</div>;
  if (isError) return <div className="text-danger">Error loading poll.</div>;
  if (!pollData) return null;

  const hasVoted = pollData.options.some(opt => opt.voted_by_me);
  const showResults = pollData.options.some(opt => opt.vote_count !== null);

  return (
    <div className="bg-surface-2 rounded-md p-4 border border-border-glow">
      <h4 className="font-bold text-text-1 mb-3">{pollData.question}</h4>
      <div className="space-y-2">
        {pollData.options.map(option => (
          <div key={option.id} className="flex items-center gap-3">
            <button
              onClick={() => handleOptionClick(option.id)}
              disabled={voteMutation.isLoading || hasVoted} // Disable voting if already voted or loading
              className={`flex-1 flex items-center gap-2 p-2 rounded-md transition-colors ${
                selectedOptions.includes(option.id) ? 'bg-primary/20 text-primary' : 'bg-surface-3 hover:bg-surface-4'
              } ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {pollData.multiple_choice ? (
                selectedOptions.includes(option.id) ? <CheckCircle className="w-4 h-4" /> : <Square className="w-4 h-4" />
              ) : (
                selectedOptions.includes(option.id) ? <Radio className="w-4 h-4 fill-current" /> : <Radio className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{option.option_text}</span>
            </button>
            {showResults && option.vote_count !== null && (
              <div className="w-20 text-right text-sm text-text-2">
                {option.vote_count} votes ({pollData.total_votes > 0 ? ((option.vote_count / pollData.total_votes) * 100).toFixed(0) : 0}%)
              </div>
            )}
          </div>
        ))}
      </div>
      {!hasVoted && !showResults && (
        <p className="text-sm text-text-3 mt-3">Vote to see results.</p>
      )}
      {hasVoted && !showResults && (
        <p className="text-sm text-text-3 mt-3">Results will be visible {pollData.results_visibility === 'after_close' ? 'after the poll closes' : 'after you vote'}.</p>
      )}
      {showResults && pollData.total_votes !== null && (
        <p className="text-sm text-text-3 mt-3">Total votes: {pollData.total_votes}</p>
      )}
    </div>
  );
};

export default PollWidget;