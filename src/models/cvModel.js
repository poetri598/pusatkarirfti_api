import { getUserByUserName } from "./userModel.js";
import { getUserPlatformsByUsername } from "./userPlatformModel.js";
import { getUserWorkExperiencesByUsername } from "./userWorkExperienceModel.js";
import { getUserOrganizationExperiencesByUsername } from "./userOrganizationExperienceModel.js";
import { getUserEducationsByUsername } from "./userEducationModel.js";
import { getUserAchievementsByUsername } from "./userAchievementModel.js";
import { getUserSkillsByUsername } from "./userSkillModel.js";

// GET CV BY USERNAME
export const getUserCVByUsername = async (username) => {
  try {
    const user = await getUserByUserName(username);
    if (!user) return null;

    const platforms = await getUserPlatformsByUsername(username);
    const work_experiences = await getUserWorkExperiencesByUsername(username);
    const organization_experiences = await getUserOrganizationExperiencesByUsername(username);
    const educations = await getUserEducationsByUsername(username);
    const achievements = await getUserAchievementsByUsername(username);
    const skills = await getUserSkillsByUsername(username);

    return {
      user,
      platforms,
      work_experiences,
      organization_experiences,
      educations,
      achievements,
      skills,
    };
  } catch (error) {
    throw error;
  }
};
