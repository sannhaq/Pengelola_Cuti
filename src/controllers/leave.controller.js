const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  calculateLeaveAmount,
  paginate,
  successResponseWithPage,
} = require('../utils/helper.util');
const { meta } = require('eslint-plugin-prettier');

async function getLeaveHistoryNik(req, res) {
  try {
    const { nik } = req.params;

    // Extract page and perPage from query parameters
    const { page, perPage } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.leaveEmployee, { page, perPage });

    const leaveHistory = await prisma.leaveEmployee.findMany({
      where: { employeeNik: nik },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
        leave: {
          select: {
            id: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
            startLeave: true,
            endLeave: true,
            reason: true,
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    if (!leaveHistory || leaveHistory.length === 0) {
      return successResponse(res, 'No leave history found', [], 200, pagination.meta);
    }

    // Gabungkan cuti individual ke dalam satu array
    const allLeaves = leaveHistory.map((item) => ({
      ...item.employee,
      ...item.leave,
      status: item.status, // Tambahkan status jika diperlukan
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
    }));

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history',
      allLeaves,
      200,
      pagination.meta,
    );
  } catch (error) {
    console.error('Error getting leave history:', error);
    return errorResponse(res, 'Failed to get leave history', '', 500);
  }
}

async function getLeaveHistoryMe(req, res) {
  try {
    // Menggunakan Prisma untuk mengambil informasi cuti yang diajukan
    const userId = req.user.id;
    // Extract page and perPage from query parameters
    const { page, perPage } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.user, { page, perPage });

    const userLeaveInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employee: {
          select: {
            leaveEmployees: {
              select: {
                id: true,
                status: true,
                leave: {
                  select: {
                    id: true,
                    typeOfLeaveId: true,
                    typeOfLeave: {
                      select: {
                        name: true,
                      },
                    },
                    startLeave: true,
                    endLeave: true,
                    reason: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Gunakan skip dan take di sini berdasarkan data paginasi
    const paginatedLeaves = userLeaveInfo.employee.leaveEmployees.slice(
      (pagination.meta.currPage - 1) * pagination.meta.perPage,
      pagination.meta.currPage * pagination.meta.perPage,
    );

    // Gabungkan cuti individual dan cuti kolektif ke dalam satu array
    const allLeaves = paginatedLeaves.map((item) => ({
      ...item.leave,
      leaveEmployeeId: item.id,
      status: item.status,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
    }));

    // Membuat objek sanitizedUser dengan menggabungkan beberapa properti dari objek leave
    const sanitizedUser = {
      id: userLeaveInfo.id,
      employee: {
        // Menyalin properti employee dari objek leave
        leaves: allLeaves,
      },
    };

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history',
      sanitizedUser,
      200,
      pagination.meta,
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

async function mandatoryLeave(req, res) {
  try {
    // Extract page and perPage from query parameters
    const { page, perPage } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.typeOfLeave, { page, perPage });

    // Menggunakan Prisma untuk mengambil informasi tentang jenis dengan pagination
    const mandatory = await prisma.typeOfLeave.findUnique({
      where: { id: 1 },
      select: {
        name: true,
        leaves: {
          select: {
            id: true,
            reason: true,
            startLeave: true,
            endLeave: true,
          },
          skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
          take: pagination.meta.perPage,
        },
      },
    });

    // Fungsi untuk memformat tanggal ke dalam "yyyy-mm-dd"
    function formatDate(date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      return formattedDate;
    }

    // Memformat tanggal untuk setiap entri di leaves
    const formattedLeaves = mandatory?.leaves.map((leave) => ({
      ...leave,
      startLeave: formatDate(leave.startLeave),
      endLeave: formatDate(leave.endLeave),
      leaveUse: calculateLeaveAmount(leave.startLeave, leave.endLeave),
    }));

    return successResponseWithPage(
      res,
      'Successfully retrieved mandatory leave',
      formattedLeaves,
      200,
      pagination.meta,
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function optionalLeave(req, res) {
  try {
    // Extract page and perPage from query parameters
    const { page, perPage } = req.query;
    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.typeOfLeave, { page, perPage });
    // Menggunakan Prisma untuk mengambil informasi cuti yang diajukan
    const userId = req.user.id;
    const userLeaveInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employee: {
          select: {
            leaveEmployees: {
              where: { leave: { typeOfLeaveId: 2 } },
              select: {
                id: true,
                status: true,
                leave: {
                  select: {
                    id: true,
                    startLeave: true,
                    endLeave: true,
                    reason: true,
                    typeOfLeave: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
              skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
              take: pagination.meta.perPage,
            },
          },
        },
      },
    });

    // Gabungkan cuti individual dan cuti kolektif ke dalam satu array
    const allLeaves = userLeaveInfo.employee.leaveEmployees.map((item) => ({
      ...item.leave,
      leaveEmployeeId: item.id,
      status: item.status,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
    }));

    // Membuat objek sanitizedUser dengan menggabungkan beberapa properti dari objek leave
    const sanitizedUser = {
      id: userLeaveInfo.id,
      employee: {
        // Menyalin properti employee dari objek leave
        leaves: allLeaves,
      },
    };

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history',
      sanitizedUser,
      200,
      pagination.meta,
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function collectiveLeave(req, res) {
  try {
    const { typeOfLeaveId, reason, startLeave, endLeave } = req.body;

    // Temukan karyawan yang memenuhi kriteria
    const eligibleEmployee = await prisma.employee.findMany({
      where: {
        user: {
          role: {
            id: {
              in: [2, 3],
            },
          },
        },
      },
    });

    if (!eligibleEmployee || eligibleEmployee.length === 0) {
      return errorResponse(res, 'There are no employees that meet the criteria', null, 404);
    }

    // Simpan data cuti
    const leaveData = await prisma.leave.create({
      data: {
        typeOfLeaveId,
        reason,
        startLeave,
        endLeave,
      },
    });

    // Dapatkan ID cuti yang baru saja dibuat
    const leaveId = leaveData.id;

    // Simpan data collectiveLeave dengan menghubungkan ke ID cuti
    await prisma.leaveEmployee.createMany({
      data: eligibleEmployee.map((emp) => ({
        leaveId,
        employeeNik: emp.nik.toString(),
        status: 'APPROVE',
      })),
    });

    // Hitung jumlah hari cuti antara startLeave dan endLeave
    const numberOfLeaveDays = calculateLeaveAmount(startLeave, endLeave);

    // Kurangkan amountOfLeave pada karyawan yang terkait
    await prisma.employee.updateMany({
      where: {
        nik: {
          in: eligibleEmployee.map((emp) => emp.nik),
        },
      },
      data: {
        amountOfLeave: {
          decrement: numberOfLeaveDays,
        },
      },
    });

    return successResponse(res, 'Data successfully saved', leaveData);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function rejectOptionalLeave(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Dapatkan nik dari employee yang sedang login
    const employeeNik = await prisma.user
      .findUnique({
        where: { id: userId },
        select: { employee: { select: { nik: true } } },
      })
      .then((user) => user.employee?.nik);

    // Periksa apakah employeeNik dari user yang login sama dengan employeeNik di leaveEmployee
    const isAuthorized = await prisma.leaveEmployee.findUnique({
      where: { id: parseInt(id) },
      select: { employeeNik: true, leaveId: true },
    });

    // Jika tidak diizinkan
    if (!isAuthorized || isAuthorized.employeeNik !== employeeNik) {
      return errorResponse(res, 'Forbidden', null, 403);
    }

    // Dapatkan informasi cuti (startLeave dan endLeave) dari tabel Leave berdasarkan leaveId
    const leaveInfo = await prisma.leave.findUnique({
      where: { id: isAuthorized.leaveId },
      select: { startLeave: true, endLeave: true },
    });

    // Dapatkan informasi cuti yang diperbarui setelah di-REJECT
    const rejectStatus = await prisma.leaveEmployee.findUnique({
      where: { id: parseInt(id) },
      select: { status: true },
    });
    // Periksa status apakah sudah 'REJECT'
    if (rejectStatus.status === 'REJECT') {
      return errorResponse(res, 'Leave status is already REJECT', null, 400);
    }

    // Dapatkan informasi cuti yang diperbarui setelah di-REJECT
    const updatedLeave = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECT',
      },
    });

    // Hitung jumlah cuti
    const leaveAmount = calculateLeaveAmount(leaveInfo.startLeave, leaveInfo.endLeave);

    // Menambahkan amountOfLeave pada karyawan terkait
    await prisma.employee.update({
      where: { nik: employeeNik },
      data: {
        amountOfLeave: {
          increment: leaveAmount,
        },
      },
    });

    return successResponse(res, 'Leave status updated to REJECT', updatedLeave);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createPersonalLeave(req, res) {
  try {
    const { reason, startLeave, endLeave } = req.body;
    const { nik } = req.params;

    // Simpan data cuti
    const leaveData = await prisma.leave.create({
      data: {
        typeOfLeaveId: 3,
        reason,
        startLeave,
        endLeave,
      },
    });

    // Dapatkan ID cuti yang baru saja dibuat
    const leaveId = leaveData.id;

    //Simpan data dengan menghubungkan ke ID cuti
    await prisma.leaveEmployee.create({
      data: {
        leaveId: leaveId,
        employeeNik: nik,
      },
    });

    return successResponse(res, 'Data succcessfully created', leaveData);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function approvePersonalLeave(req, res) {
  try {
    const { id } = req.params;

    // Dapatkan informasi leaveEmployee berdasarkan ID
    const leaveEmployeeInfo = await prisma.leaveEmployee.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        status: true,
        employeeNik: true,
        leave: {
          select: {
            typeOfLeaveId: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
    });

    // Cek apakah typeOfLeaveId di tabel leave adalah 3(personal)
    if (leaveEmployeeInfo.leave.typeOfLeaveId !== 3) {
      return errorResponse(res, 'Invalid typeOfLeaveId for personal leave', null, 400);
    }
    // Cek apakah status sudah APPROVE
    if (leaveEmployeeInfo.status === 'APPROVE') {
      return errorResponse(res, 'Leave status is already APPROVE', null, 400);
    }

    const updateStatus = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVE',
      },
    });

    // Hitung jumlah cuti yang digunakan
    const leaveUse = calculateLeaveAmount(
      leaveEmployeeInfo.leave.startLeave,
      leaveEmployeeInfo.leave.endLeave,
    );

    // megurangi amountOfLeave pada karyawan terkait
    await prisma.employee.update({
      where: { nik: leaveEmployeeInfo.employeeNik },
      data: {
        amountOfLeave: {
          decrement: leaveUse,
        },
      },
    });

    return successResponse(res, 'Leave status updated to APPROVE', updateStatus);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function rejectPersonalLeave(req, res) {
  try {
    const { id } = req.params;

    //Dapatkan informasi leaveEmployee berdasarkan ID
    const leaveEmployeeInfo = await prisma.leaveEmployee.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        status: true,
        employeeNik: true,
        leave: {
          select: {
            typeOfLeaveId: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
    });
    //cek apakah typeOfLeave di rabel leave adalah 3 (personal)
    if (leaveEmployeeInfo.leave.typeOfLeaveId !== 3) {
      return errorResponse(res, 'Invalid typeOfLeaveId for personal leave', null, 400);
    }

    //cek apakah status sudah REJECT
    if (leaveEmployeeInfo.status === 'REJECT') {
      return errorResponse(res, 'Leave status is already REJECTED', null, 400);
    }

    //hitung jumlah cuti yang digunakan
    const leaveUse = calculateLeaveAmount(
      leaveEmployeeInfo.leave.startLeave,
      leaveEmployeeInfo.leave.endLeave,
    );

    //update status menjadi reject
    const updateStatus = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECT',
      },
    });
    //menambahkan kembali amount of leave jika status leave sudah approve
    if (leaveEmployeeInfo.status === 'APPROVE') {
      await prisma.employee.update({
        where: { nik: leaveEmployeeInfo.employeeNik },
        data: {
          amountOfLeave: {
            increment: leaveUse,
          },
        },
      });
    }
    return successResponse(res, 'Leave status updated to REJECT', updateStatus);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

async function allLeaves(req, res) {
  try {
    // Extract page and perPage from query parameters
    const { page, perPage, search, status } = req.query;
    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.leaveEmployee, { page, perPage });

    //objek filter untuk search
    const filter = {};
    if (search) {
      filter.OR = [
        {
          employee: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          leave: {
            reason: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    //objek filter status
    if (status) {
      if (typeof status === 'string') {
        filter.status = status.toUpperCase();
      } else {
        throw new Error('Invalid status parameter');
      }
    }

    const leaveHistory = await prisma.leaveEmployee.findMany({
      where: filter,
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
        leave: {
          select: {
            id: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
            reason: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Gabungkan cuti personal
    const allLeave = leaveHistory.map((item) => ({
      ...item.employee,
      ...item.leave,
      status: item.status,
      leaveEmployeeId: item.id,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
    }));

    return successResponseWithPage(
      res,
      'Successfully get all leave history',
      allLeave,
      200,
      pagination.meta,
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get leave history', null, 500);
  }
}

module.exports = {
  getLeaveHistoryNik,
  getLeaveHistoryMe,
  mandatoryLeave,
  optionalLeave,
  collectiveLeave,
  rejectOptionalLeave,
  createPersonalLeave,
  approvePersonalLeave,
  rejectPersonalLeave,
  allLeaves,
};
