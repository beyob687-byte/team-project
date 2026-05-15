import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { clubManagementApi } from "../../api/clubManagement";

const Members = () => {
  const { clubId } = useParams();
  const [activeTab, setActiveTab] = useState("members");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, requestsData] = await Promise.all([
        clubManagementApi.getMembers(clubId, {
          page: 1,
          limit: 100,
          status: "active",
        }),
        clubManagementApi.getRequests(clubId, {
          page: 1,
          limit: 100,
          status: "pending",
        }),
      ]);
      setMembers(membersData.items || []);
      setRequests(requestsData.items || []);
    } catch (error) {
      console.error("Failed to load members screen", error);
      setMembers([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clubId]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) => {
      const fullName =
        `${member.first_name || ""} ${member.last_name || ""}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (member.email || "").toLowerCase().includes(term) ||
        (member.role || "").toLowerCase().includes(term)
      );
    });
  }, [members, search]);

  const handleRequestDecision = async (requestId, action) => {
    setActionId(requestId);
    try {
      await clubManagementApi.resolveRequest(clubId, requestId, action);
      await loadData();
    } catch (error) {
      console.error("Failed to resolve request", error);
    } finally {
      setActionId(null);
    }
  };

  const formatRole = (role) => {
    if (!role) return "Member";
    return role
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">
            Members
          </h1>
          <p className="text-text-2">
            Manage your club roster and join requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button>
            <Mail className="w-4 h-4 mr-2" /> Message All
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border-glow">
        <button
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "members" ? "border-primary text-primary" : "border-transparent text-text-2 hover:text-text-1"}`}
          onClick={() => setActiveTab("members")}
        >
          All Members ({members.length})
        </button>
        <button
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "requests" ? "border-primary text-primary" : "border-transparent text-text-2 hover:text-text-1"}`}
          onClick={() => setActiveTab("requests")}
        >
          Pending Requests ({requests.length})
        </button>
      </div>

      {activeTab === "members" ? (
        <Card>
          <div className="p-4 border-b border-border-glow flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-2/30">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
              <Input
                placeholder="Search members..."
                className="pl-9 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-2 uppercase bg-surface-2/50 border-b border-border-glow">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium">Attendance</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-glow/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-text-2">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-2/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" />
                          <div>
                            <p className="font-medium text-text-1">
                              {`${member.first_name || ""} ${member.last_name || ""}`.trim() ||
                                "Unnamed Member"}
                            </p>
                            <p className="text-xs text-text-2">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.role === "member" ? "outline" : "primary"
                          }
                        >
                          {formatRole(member.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-2">
                        {member.join_date
                          ? new Date(member.join_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-text-2">—</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-text-2 hover:text-text-1 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-text-2">
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-text-2">
                Loading requests...
              </CardContent>
            </Card>
          ) : requests.length > 0 ? (
            requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar size="md" />
                    <div>
                      <h3 className="font-medium text-text-1">
                        {`${req.first_name || ""} ${req.last_name || ""}`.trim() ||
                          req.email}
                      </h3>
                      <p className="text-sm text-text-2 mb-2">
                        {req.email} • Applied{" "}
                        {req.requested_at
                          ? new Date(req.requested_at).toLocaleDateString()
                          : "recently"}
                      </p>
                      <p className="text-sm text-text-1 bg-surface-2/50 p-3 rounded-lg border border-border-glow">
                        Membership request pending approval.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      className="flex-1 text-danger border-danger/30 hover:bg-danger/10"
                      onClick={() => handleRequestDecision(req.id, "reject")}
                      isLoading={actionId === req.id}
                    >
                      <UserX className="w-4 h-4 mr-2" /> Decline
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleRequestDecision(req.id, "approve")}
                      isLoading={actionId === req.id}
                    >
                      <UserCheck className="w-4 h-4 mr-2" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-text-2">
                No pending requests.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
