import prisma from "../lib/prisma";

const resetTables = async () => {
  // WARNINGGGG FOR DEVELOPMENT PURPOSE ONLYYYYY

  const deleteUsers = prisma.user.deleteMany();
  const deleteHabits = prisma.habit.deleteMany();
  const deleteProfile = prisma.profile.deleteMany();
  const deleteStats = prisma.userStats.deleteMany();
  const deleteHabitL = prisma.habitLog.deleteMany();
  const deleteNotif = prisma.notification.deleteMany();
  const deleteGroup = prisma.group.deleteMany();
  const deleteGroupM = prisma.groupMember.deleteMany();

  await prisma.$transaction([
    deleteNotif,
    deleteGroupM,
    deleteGroup,
    deleteHabitL,
    deleteHabits,
    deleteStats,
    deleteProfile,
    deleteUsers,
  ]);
};

export default resetTables;
