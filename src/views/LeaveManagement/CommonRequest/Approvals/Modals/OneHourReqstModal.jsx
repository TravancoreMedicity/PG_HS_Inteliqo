import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react'
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop'
import Modal from '@mui/joy/Modal';
import { Button, ModalClose, ModalDialog, Textarea, Typography } from '@mui/joy';
import { Box, } from '@mui/material';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import moment from 'moment';
import { axioslogin } from 'src/views/Axios/Axios';
import { errorNofity, infoNofity, succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { format, lastDayOfMonth, startOfMonth } from 'date-fns';
import { useSelector } from 'react-redux';

const OneHourReqstModal = ({ open, setOpen, data, setCount }) => {

    const [openBkDrop, setOpenBkDrop] = useState(false)
    const [remark, setRemark] = useState('');
    const [details, setDetails] = useState(
        {
            slno: '',
            emno: '',
            name: '',
            section: '',
            status: '',
            reqDate: '',
            dutyDate: '',
            reason: '',
            shft_desc: '',
            checkIn: '',
            checkOut: '',
            inchargeComment: '',
            hodComment: '',
            ceoComment: '',
            emid: '',
            checkInFlag: 0,
            checkOutFlag: 0,
            increq: 0,
            incaprv: 0
        }
    )
    const { slno, emno, name, section, reqDate, dutyDate, reason, shft_desc, checkIn, checkOut,
        inchargeComment, hodComment, checkInFlag, checkOutFlag, dept_sect_id,
        one_hour_day
    } = details;

    const loginem_id = useSelector((state) => state?.getProfileData?.ProfileData[0]?.em_id ?? 0)

    useEffect(() => {
        if (Object.keys(data).length !== 0) {
            const { slno, emno, name, section, status, requestDate, one_hour_duty_day, shft_desc,
                check_in, check_out, incharge_approval_comment, hod_approval_comment, reason,
                emid, checkin_flag, checkout_flag, increq, incaprv, one_hour_day } = data;
            const details = {
                slno: slno,
                emno: emno,
                name: name,
                section: section,
                status: status,
                reqDate: requestDate,
                dutyDate: one_hour_duty_day,
                reason: reason,
                shft_desc: shft_desc,
                checkIn: check_in,
                checkOut: check_out,
                inchargeComment: incharge_approval_comment,
                hodComment: hod_approval_comment,
                emid: emid,
                checkInFlag: checkin_flag,
                checkOutFlag: checkout_flag,
                increq: increq,
                incaprv: incaprv,
                one_hour_day: one_hour_day
            }
            setDetails(details)
        } else {
            setDetails({})
        }
    }, [data])

    const hrReject = useMemo(() => {
        return {
            hr_approval_status: 2,
            hr_approval_comment: remark,
            hr_approval_date: moment().format('YYYY-MM-DD HH:mm'),
            hr_empId: loginem_id,
            request_slno: slno
        }
    }, [remark, slno, loginem_id])

    const hrApprove = useMemo(() => {
        return {
            checkintime: checkIn,
            checkouttime: checkOut,
            checkinflag: checkInFlag,
            checkoutflag: checkOutFlag,
            emno: emno,
            dutyDay: moment(dutyDate).format('YYYY-MM-DD HH:mm'),
            hr_approval_status: 1,
            hr_approval_comment: remark,
            hr_approval_date: moment().format('YYYY-MM-DD HH:mm'),
            hr_empId: loginem_id,
            request_slno: slno
        }
    }, [remark, slno, checkIn, checkOut, checkInFlag, checkOutFlag,
        dutyDate, emno, loginem_id])


    const handleRejectRequest = useCallback(async () => {
        if (remark === "") {
            infoNofity("Please Add Remarks!")
        } else {
            const result = await axioslogin.patch('/CommonReqst/hr/oneHour', hrReject)
            const { message, success } = result.data;
            if (success === 1) {
                setOpenBkDrop(false)
                setOpen(false)
                setCount(Math.random())
                succesNofity(message)
            } else {
                setOpenBkDrop(false)
                setOpen(false)
                setCount(Math.random())
                errorNofity(message)
            }
        }
    }, [remark, hrReject, setCount, setOpen])

    const handleApproverequest = useCallback(async () => {
        if (remark === "") {
            infoNofity("Please Add Remarks!")
        } else {
            setOpenBkDrop(true)
            const postDataForAttendaceMark = {
                month: format(startOfMonth(new Date(dutyDate)), 'yyyy-MM-dd'),
                section: dept_sect_id
            }
            const checkPunchMarkingHr = await axioslogin.post("/attendCal/checkPunchMarkingHR/", postDataForAttendaceMark);
            const { success, data } = checkPunchMarkingHr.data
            if (success === 0 || success === 1) {
                const lastUpdateDate = data?.length === 0 ? format(startOfMonth(new Date(dutyDate)), 'yyyy-MM-dd') : format(new Date(data[0]?.last_update_date), 'yyyy-MM-dd')
                const lastDay_month = format(lastDayOfMonth(new Date(dutyDate)), 'yyyy-MM-dd')
                if ((lastUpdateDate === lastDay_month) || (lastUpdateDate > lastDay_month)) {
                    warningNofity("Punch Marking Monthly Process Done !! Can't Approve Halfday Leave Request!!  ")
                    setOpenBkDrop(false)
                    setOpen(false)
                } else {
                    const result = await axioslogin.patch('/CommonReqst/hr/comment', hrApprove)
                    const { success } = result.data;
                    if (success === 1) {
                        setOpenBkDrop(false)
                        setOpen(false)
                        setCount(Math.random())
                        succesNofity("HR Approved Successfully!")
                    } else {
                        setOpenBkDrop(false)
                        setOpen(false)
                        setCount(Math.random())
                        errorNofity("Error Occured! Contact IT")
                    }
                }
            } else {
                errorNofity("Error getting PunchMarkingHR ")
            }
        }
    }, [remark, dutyDate, dept_sect_id, hrApprove, setCount, setOpen])


    return (
        <Fragment>
            <CustomBackDrop open={openBkDrop} text="Please wait !. Leave Detailed information Updation In Process" />
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <ModalDialog size="lg"  >
                    <ModalClose
                        variant="outlined"
                        sx={{
                            top: 'calc(-1/4 * var(--IconButton-size))',
                            right: 'calc(-1/4 * var(--IconButton-size))',
                            boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                            borderRadius: '50%',
                            bgcolor: 'background.body',
                        }}
                    />
                    <Box sx={{ display: 'flex', flex: 1, alignContent: 'center', alignItems: 'center', }} >
                        <Typography
                            fontSize="xl2"
                            lineHeight={1}
                            startDecorator={
                                <EmojiEmotionsOutlinedIcon sx={{ color: 'green' }} />
                            }
                            sx={{ display: 'flex', alignItems: 'flex-start', mr: 2, }}
                        >
                            {name}
                        </Typography>
                        <Typography
                            lineHeight={1}
                            component="h3"
                            id="modal-title"
                            level="h5"
                            textColor="inherit"
                            fontWeight="md"
                            endDecorator={<Typography
                                level="h6"
                                justifyContent="center"
                                alignItems="center"
                                alignContent='center'
                                lineHeight={1}
                            >
                                {emno}
                            </Typography>}
                            sx={{ color: 'neutral.400', display: 'flex', }}
                        >
                            {`employee #`}
                        </Typography>
                        <Typography level="body1" sx={{ px: 1, textTransform: "lowercase" }} >
                            {section}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex', justifyContent: 'center',
                            alignItems: 'center', px: 1, borderBlockStyle: 'outset',
                            flexDirection: 'column',
                        }} >
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }} >
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    Request Date
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{reqDate}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }} >
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    Shift
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{shft_desc}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }} >
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    One Hour day
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{one_hour_day}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }} >
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    One Hour Time
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{checkInFlag === 1 ? 'In Punch Time' : checkOutFlag === 1 ? 'Out Punch Time' : null}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }} >
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    Reason
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{reason}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    Incharge Comment
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{inchargeComment === null ? 'NIL' : inchargeComment === '' ? 'NIL' : inchargeComment}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', width: '100%', }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg"  >
                                    Hod Comment
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                <Typography fontSize="sm" fontWeight="lg" sx={{ flex: 1, pl: 2 }} >
                                    :{hodComment === null ? 'NIL' : hodComment === '' ? 'NIL' : hodComment}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ pt: 0.5 }} >
                        <Textarea name="Outlined" placeholder="Remark For Approve/Reject The Request here…"
                            variant="outlined" onChange={(e) => setRemark(e.target.value)} />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
                            <Button variant="solid" color="success" onClick={handleApproverequest}>
                                Request Approve
                            </Button>
                            <Button variant="solid" color="danger" onClick={handleRejectRequest}>
                                Request Reject
                            </Button>
                        </Box>
                    </Box>
                </ModalDialog>
            </Modal>
        </Fragment>
    )
}

export default memo(OneHourReqstModal) 