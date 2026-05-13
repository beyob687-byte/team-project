import React from 'react';
import { ShieldCheck, ArrowLeft, Building, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AiBadge from '../../components/shared/AiBadge';

const ClubRegistrationReview = () => {
  const { requestId } = useParams();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/admin/moderation" className="inline-flex items-center text-sm text-text-2 hover:text-primary transition-colors mb-2 group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Queue
      </Link>

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Registration Review</h1>
          <p className="text-text-2">Review application for new club establishment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-danger border-danger/30 hover:bg-danger/10">Reject</Button>
          <Button className="bg-success hover:bg-success/80 text-deep"><ShieldCheck className="w-4 h-4 mr-2" /> Approve Club</Button>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-primary flex items-center gap-2">AI Compliance Check</h3>
            <AiBadge />
          </div>
          <p className="text-sm text-text-1">
            Application passes all automated compliance checks. Similar clubs exist (e.g. "Software Engineering Club"), but proposed activities differentiate this organization.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Details: Blockchain Society</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-text-2 mb-1">Proposed Name</p>
              <p className="font-medium text-text-1">Blockchain Society</p>
            </div>
            <div>
              <p className="text-sm text-text-2 mb-1">Category</p>
              <Badge variant="outline">Technology</Badge>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-text-2 mb-1">Mission Statement</p>
              <p className="text-text-1 bg-surface-2/50 p-4 rounded-lg border border-border-glow">
                To educate students about decentralized technologies, smart contracts, and Web3 development through hands-on workshops and industry networking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leadership Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border-glow rounded-lg bg-surface-2/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">EA</div>
                <div>
                  <p className="font-medium text-text-1">Eve Adams (Applicant)</p>
                  <p className="text-xs text-text-2">eva.a@uni.edu • Senior • Computer Science</p>
                </div>
              </div>
              <Badge variant="primary">Proposed President</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ClubRegistrationReview;
