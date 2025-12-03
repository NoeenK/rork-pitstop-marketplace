const TBA_API_KEY = "VgqyN0JpIgYpvjxlY7MabHpOcud0XEMvLneR0Kvw6eUio9bOIA8WnB4AKb2jDdZE";
const TBA_BASE_URL = "https://www.thebluealliance.com/api/v3";

export interface TBATeam {
  key: string;
  team_number: number;
  nickname: string;
  name: string;
  city?: string;
  state_prov?: string;
  country?: string;
  school_name?: string;
}

export interface TBATeamSimple {
  key: string;
  team_number: number;
  nickname: string;
  name: string;
}

export async function searchTeams(query: string): Promise<TBATeamSimple[]> {
  try {
    const teamNumber = parseInt(query, 10);
    if (isNaN(teamNumber) || query.length < 1) {
      return [];
    }

    const response = await fetch(
      `${TBA_BASE_URL}/teams/${Math.floor(teamNumber / 500)}`,
      {
        headers: {
          "X-TBA-Auth-Key": TBA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("[TBA] Search teams failed:", response.status);
      return [];
    }

    const teams: TBATeam[] = await response.json();
    
    return teams
      .filter(team => 
        team.team_number.toString().includes(query) ||
        team.nickname?.toLowerCase().includes(query.toLowerCase()) ||
        team.name?.toLowerCase().includes(query.toLowerCase())
      )
      .map(team => ({
        key: team.key,
        team_number: team.team_number,
        nickname: team.nickname || team.name,
        name: team.name,
      }))
      .slice(0, 50);
  } catch (error) {
    console.error("[TBA] Search teams error:", error);
    return [];
  }
}

export async function getTeamByNumber(teamNumber: number): Promise<TBATeam | null> {
  try {
    console.log("[TBA] Fetching team:", teamNumber);
    
    const response = await fetch(
      `${TBA_BASE_URL}/team/frc${teamNumber}`,
      {
        headers: {
          "X-TBA-Auth-Key": TBA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("[TBA] Get team failed:", response.status);
      return null;
    }

    const team: TBATeam = await response.json();
    console.log("[TBA] Team found:", team.nickname);
    return team;
  } catch (error) {
    console.error("[TBA] Get team error:", error);
    return null;
  }
}

export async function getAllTeams(page: number = 0): Promise<TBATeamSimple[]> {
  try {
    const response = await fetch(
      `${TBA_BASE_URL}/teams/${page}`,
      {
        headers: {
          "X-TBA-Auth-Key": TBA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("[TBA] Get all teams failed:", response.status);
      return [];
    }

    const teams: TBATeam[] = await response.json();
    
    return teams.map(team => ({
      key: team.key,
      team_number: team.team_number,
      nickname: team.nickname || team.name,
      name: team.name,
    }));
  } catch (error) {
    console.error("[TBA] Get all teams error:", error);
    return [];
  }
}
