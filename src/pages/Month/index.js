import { NavBar, DatePicker } from 'antd-mobile'
import './index.scss'
import { useMemo, useState, useEffect } from 'react'
import classNames from "classnames"
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import _ from "lodash"
import DayBill from './components/DayBill'

const Month = () => {
  // 按月份做数据的分组
  const { billList } = useSelector(state => state.bill)
  const monthGroup = useMemo(() => {
    // return计算之后的值
    return _.groupBy(billList, item => dayjs(item.date).format("YYYY-MM"))
  }, [billList])
  // console.log(monthGroup)

  // 控制弹框的打开和关闭
  const [dateVisible, setDateVisible] = useState(false)
  // 控制时间显示
  // const [currentDate, setCurrentDate] = useState(() => {
  //   return dayjs(new Date()).format("YYYY-MM")
  // })
  const [currentDate, setCurrentDate] = useState(dayjs(new Date()).format("YYYY-MM"))
  // const [currentDate, setCurrentDate] = useState(new Date())
  const [currentMonthList, setCurrentMonthList] = useState([])

  const monthResult = useMemo(() => {
    // 支出 收入 结余
    const pay = currentMonthList.filter(item => item.type === "pay").reduce((prev, curr) => prev + curr.money, 0)
    const income = currentMonthList.filter(item => item.type === "income").reduce((prev, curr) => prev + curr.money, 0)
    return { pay, income, total: pay + income }
  }, [currentMonthList])

  // 初始化的时候把当前月的统计数据显示出来
  useEffect(() => {
    const nowDate = dayjs().format("YYYY-MM")
    // 边界值控制
    if (monthGroup[nowDate]) {
      setCurrentMonthList(monthGroup[nowDate])
    }
  }, [monthGroup])

  // 确认回调
  const onConfirm = (date) => {
    const formatDate = dayjs(date).format("YYYY-MM")
    // 边界值控制
    if (monthGroup[formatDate]) {
      setCurrentMonthList(monthGroup[formatDate])
    }
    setCurrentDate(formatDate)
  }

  // 当前月按照日来做分组
  const dayGroup = useMemo(() => {
    const dayGroupData = _.groupBy(currentMonthList, item => dayjs(item.date).format("YYYY-MM-DD"))
    const dates = Object.keys(dayGroupData)
    return {
      dayGroupData,
      dates
    }
  }, [currentMonthList])

  return (
    <div className="monthlyBill">
      <NavBar className="nav" backArrow={false}>
        月度收支
      </NavBar>
      <div className="content">
        <div className="header">
          {/* 时间切换区域 */}
          <div className="date" onClick={() => setDateVisible(true)}>
            <span className="text">
              {currentDate}月账单
            </span>
            <span className={classNames("arrow", { 'expand': dateVisible })}></span>
          </div>
          {/* 统计区域 */}
          <div className='twoLineOverview'>
            <div className="item">
              <span className="money">{monthResult.pay.toFixed(2)}</span>
              <span className="type">支出</span>
            </div>
            <div className="item">
              <span className="money">{monthResult.income.toFixed(2)}</span>
              <span className="type">收入</span>
            </div>
            <div className="item">
              <span className="money">{monthResult.total.toFixed(2)}</span>
              <span className="type">结余</span>
            </div>
          </div>
          {/* 时间选择器 */}
          <DatePicker
            className="kaDate"
            title="记账日期"
            precision="month"
            visible={dateVisible}
            onClose={() => setDateVisible(false)}
            onConfirm={onConfirm}
            max={new Date()}
          />
        </div>
        {/* 单日列表统计 */}
        {dayGroup.dates.map(item => {
          return <DayBill key={item} date={item} billList={dayGroup.dayGroupData[item]} />
        })}
      </div>
    </div >
  )
}

export default Month