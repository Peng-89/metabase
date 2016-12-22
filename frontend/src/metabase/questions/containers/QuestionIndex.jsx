import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Motion, spring, presets } from "react-motion";
import Collapse from "react-collapse";

import Icon from "metabase/components/Icon";
import Button from "metabase/components/Button";
import ExpandingSearchField from "../components/ExpandingSearchField";
import Tooltip from "metabase/components/Tooltip";

import CollectionButtons from "../components/CollectionButtons"

import EntityList from "./EntityList";

import { search } from "../questions";
import { loadCollections } from "../collections";
import { getUserIsAdmin } from "metabase/selectors/user";

import { push } from "react-router-redux";

const mapStateToProps = (state, props) => ({
    items: state.questions.entities.cards,
    sectionId: state.questions.section,
    collections: state.collections.collections,

    isAdmin: getUserIsAdmin(state)
})

const mapDispatchToProps = ({
    search,
    loadCollections,
    push,
})

@connect(mapStateToProps, mapDispatchToProps)
export default class QuestionIndex extends Component {
    constructor (props) {
        super(props);
        this.state = {
            questionsExpanded: true
        }
    }
    componentWillMount () {
        this.props.loadCollections();
    }

    render () {
        const { collections, push, location, isAdmin } = this.props;
        const { questionsExpanded } = this.state;
        const hasCollections = collections.length > 0;
        const showCollections = isAdmin || hasCollections;
        return (
            <div className="relative mx4">
                <div className="flex align-center pt4 pb2">
                    <h2>{ showCollections ? "Collections of Questions" : "Saved Questions" }</h2>
                    <div className="flex align-center ml-auto">
                        <ExpandingSearchField className="mr2" onSearch={this.props.search} />

                        { hasCollections &&
                            <Tooltip tooltip="Set permissions for collections">
                                <Link to="/collections/permissions" className="mx2 text-brand-hover">
                                    <Icon name="lock" />
                                </Link>
                            </Tooltip>
                        }

                        <Tooltip tooltip="View the archive">
                            <Link to="/questions/archive" className="mx2 text-brand-hover">
                                <Icon name="viewArchive" />
                            </Link>
                        </Tooltip>
                    </div>
                </div>
                { showCollections &&
                    <div className="mb2">
                        { collections.length > 0 ?
                            <CollectionButtons collections={collections} isAdmin={isAdmin} />
                        :
                            <CollectionEmptyState />
                        }
                    </div>
                }
                { showCollections &&
                    <div
                        className="inline-block mt2 mb2 cursor-pointer text-brand-hover"
                        onClick={() => this.setState({ questionsExpanded: !questionsExpanded })}
                    >
                        <div className="flex align-center">
                            <Motion defaultStyle={{ deg: 0 }} style={{ deg: questionsExpanded ? spring(0, presets.gentle) : spring(270, presets.gentle) }}>
                                { motionStyle =>
                                    <Icon
                                        className="ml1 mr1"
                                        name="expandarrow"
                                        style={{
                                            transform: `rotate(${motionStyle.deg}deg)`
                                        }}
                                    />
                                }
                            </Motion>
                            <h2>Everything Else</h2>
                        </div>
                    </div>
                }
                <Collapse isOpened={questionsExpanded || !showCollections} keepCollapsedContent={true}>
                    <EntityList
                        query={{ f: "all", collection: "", ...location.query }}
                        onChangeSection={(section) => push({
                            ...location,
                            query: { ...location.query, f: section }
                        })}
                        emptyState="Questions that aren’t in a collection will be shown here"
                    />
                </Collapse>
            </div>
        )
    }
}

const CollectionEmptyState = () =>
    <div className="flex align-center p2 bordered border-med border-brand rounded bg-grey-0 text-brand">
        <Icon name="collection" size={32} className="mr2"/>
        <div className="flex-full">
            <h3>Create collections for your saved questions</h3>
            <div className="mt1">
                Collections help you organize your questions and allow you to decide who gets to see what.
                <Link to="http://metabase.com/FIXME">Learn more</Link>
            </div>
        </div>
        <Link to="/collections/create">
            <Button primary>Create a collection</Button>
        </Link>
    </div>
