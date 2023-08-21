import { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';

import Searchbar from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { fetchImages } from 'services/api';
import { Button } from './Button/Button';
import { Modal } from './Modal/Modal';
import { Error } from './Error/Error';

const toastConfig = {
  position: 'top-left',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};
export class App extends Component {
  state = {
    images: [],
    searchQuery: '',
    page: 1,
    loading: false,
    loadMoreBtn: false,
    error: false,

    modal: { isOpen: false, imgURL: '' },
  };

  handleFormSubmit = searchQuery => {
    this.setState({ searchQuery });
  };

  onLoadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  onOpenModal = imgURL => {
    this.setState({ modal: { isOpen: true, imgURL: imgURL } });
  };

  onCloseModal = () => {
    this.setState({ modal: { isOpen: false, imgURL: false } });
  };

  async componentDidUpdate(prevProps, prevState) {
    const { searchQuery, page } = this.state;
    const prevSearchQuery = prevState.searchQuery;
    const prevPage = prevState.page;

    if (searchQuery !== prevSearchQuery || prevPage !== page) {
      try {
        this.setState({ loading: true });
        const images = await fetchImages(searchQuery, page);

        const totalHits = images.totalHits;
        const totalPages = Math.ceil(totalHits / 12);
        const isMorePages = page < totalPages;

        if (prevSearchQuery !== searchQuery) {
          this.setState({ images: images.hits, loadMoreBtn: isMorePages });
        } else {
          this.setState({
            images: [...prevState.images, ...images.hits],
            loadMoreBtn: isMorePages,
          });
        }

        if (images.hits.length === 0) {
          toast.warn('...ooops! No images', toastConfig);
        }

        if (page === 1 && images.hits.length > 0) {
          toast.success('Your images were successfully fetched!', toastConfig);
        }

        if (page === totalPages) {
          this.setState({ loadMoreBtn: false });
        }
      } catch (error) {
        this.setState({ error: error.message });
        toast.error(error.message, toastConfig);
      } finally {
        this.setState({ loading: false });
      }
    }
  }
  //==========================================================
  render() {
    const { images, loading, loadMoreBtn, error, modal } = this.state;
    return (
      <div>
        <ToastContainer />

        {loading && (
          <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#3f51b5"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClassName=""
            visible={true}
          />
        )}
        <Searchbar onSubmit={this.handleFormSubmit} />
        {error && <Error error={error} />}
        <ImageGallery images={images} onOpenModal={this.onOpenModal} />
        {loadMoreBtn && <Button onClick={this.onLoadMore} />}
        {modal.isOpen && (
          <Modal
            onCloseModal={this.onCloseModal}
            onOpenModal={this.onOpenModal}
            imgURL={modal.imgURL}
          />
        )}
      </div>
    );
  }
}

