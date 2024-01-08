import { ShareAlt, Table } from "@styled-icons/fa-solid"
import { useState } from "react"
import TabLeft from '../../Images/tab_left.png'
import TabRight from '../../Images/tab_right.png'
import TabLeftSelected from '../../Images/tab_left_selected.png'
import TabRightSelected from '../../Images/tab_right_selected.png'
import TabGeneral from "./HeaderTabs/TabGeneral"

const DocumentHeader = ({setShowSharePopup}) => {
    const [currentTab, setCurrentTab] = useState(0)

    const tabs = [
        {id: 0, name: "General", tab: <TabGeneral />},
        {id: 1, name: "Edit"},
        {id: 3, name: "Insert"},
        {id: 4, name: "Document"}
    ]
    return <div className="documentHeader">
        <div className="documentHeaderTabs">
            {tabs.map((tab) => 
                <div className="headerTab" onClick={() => setCurrentTab(tab.id)}>
                    <img src={tab.id === currentTab ? TabLeftSelected : TabLeft} />
                    <div className={"headerTab_inner" + (tab.id === currentTab ? '_selected' : '')}>
                        {tab.name}
                    </div>
                    <img src={tab.id === currentTab ? TabRightSelected : TabRight} />
                </div>
            )}
        </div>
        <div className="documentHeaderBody">
            {
                tabs.find((t) => t.id === currentTab)?.tab ?? null
            }
        </div>
    <div className="alignRight">
        <div className="shareButton" onClick={() => setShowSharePopup(true)}>
            <ShareAlt width="30px" height="30px"/>
        </div>
    </div>
</div>
}

export default DocumentHeader